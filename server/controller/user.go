package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/melsonic/syncpad/model"
	"golang.org/x/crypto/bcrypt"
)

// / Sign Up Controller
func UserCreateController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var userData model.User
		decodeRequestBodyErr := json.Unmarshal(r_body, &userData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		if userData.Email == "" || userData.Username == "" || userData.Password == "" {
			fmt.Fprintln(w, "Please enter valid credentials")
			return
		}
		bytePassword, encryptionError := bcrypt.GenerateFromPassword([]byte(userData.Password), EncryptCost)
		if utilErrorReturn(encryptionError, &w, http.StatusInternalServerError, "Error in password encryption") {
			return
		}
		userData.Password = string(bytePassword)

		/// Generate a jwt access token
		requestClaims := jwt.MapClaims{
			"username": userData.Username,
			"iat":      jwt.NewNumericDate(time.Now()),
			"exp":      jwt.NewNumericDate(time.Now().Add(time.Hour)),
			"iss":      os.Getenv("JWT_ISSUER"),
		}
		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, requestClaims)
		myJwtKey := []byte(os.Getenv("JWT_SIGNARUTE"))
		signedAccessToken, signingError := accessToken.SignedString(myJwtKey)
		if utilErrorReturn(signingError, &w, http.StatusBadRequest, "Error signing the token") {
			return
		}
		responseContent := map[string]any{
			"access-token": signedAccessToken,
			"message":      "user created successfully!!!",
		}
		/// finally insert the user
		_, insertUserError := conn.Exec(context.Background(), "INSERT INTO USER_DATA (email, username, password) VALUES ($1, $2, $3)", userData.Email, userData.Username, userData.Password)
		if utilErrorReturn(insertUserError, &w, http.StatusInternalServerError, "Error creating a user") {
			return
		}
		utilSuccess(&w, http.StatusOK, responseContent)
	}
}

// / Login Controller
func UserLoginController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var userData model.User
		decodeRequestBodyErr := json.Unmarshal(r_body, &userData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		username := userData.Username
		password := userData.Password
		if username == "" || password == "" {
			fmt.Fprintln(w, "Please enter credentials to process")
			return
		}
		var dbusername string
		var dbpassword string
		errFetchingUser := conn.QueryRow(context.Background(), "SELECT username, password FROM user_data WHERE username=$1", username).Scan(&dbusername, &dbpassword)
		if utilErrorReturn(errFetchingUser, &w, http.StatusInternalServerError, "Error fetching user") {
			return
		}
		if utilErrorReturn(bcrypt.CompareHashAndPassword([]byte(dbpassword), []byte(password)), &w, http.StatusBadRequest, "Invalid credentials") {
			return
		}
		/// Generate a jwt access token
		requestClaims := jwt.MapClaims{
			"username": username,
			"iat":      jwt.NewNumericDate(time.Now()),
			"exp":      jwt.NewNumericDate(time.Now().Add(time.Hour)),
			"iss":      os.Getenv("JWT_ISSUER"),
		}
		accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, requestClaims)
		myJwtKey := []byte(os.Getenv("JWT_SIGNARUTE"))
		signedAccessToken, signingError := accessToken.SignedString(myJwtKey)
		if utilErrorReturn(signingError, &w, http.StatusBadRequest, "Error signing the token") {
			return
		}
		responseContent := map[string]any{
			"access-token": signedAccessToken,
			"message":      "login successfull!!!",
		}
		utilSuccess(&w, http.StatusOK, responseContent)
	}
}

func UserAuthorize(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		responseContent := map[string]any{
			"message": "user authorized!!!",
		}
		jsonData, jsonMarshalError := json.Marshal(responseContent)
		if utilErrorReturn(jsonMarshalError, &w, http.StatusInternalServerError, "Internal server error") {
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Header().Add("Content-Type", "application/json")
		w.Write(jsonData)
		return
	}
}

func UserDeleteController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := r.Context().Value("username").(string)
		_, deleteUserPagesError := conn.Exec(context.Background(), "DELETE FROM page WHERE user_id = (SELECT user_id FROM user_data WHERE username=$1)", username)
		if utilErrorReturn(deleteUserPagesError, &w, http.StatusInternalServerError, "Error deleting user pages") {
			return
		}
		_, err := conn.Exec(context.Background(), "DELETE FROM user_data WHERE username=$1", username)
		if utilErrorReturn(err, &w, http.StatusInternalServerError, "Error deleting the user") {
			return
		}
		fmt.Fprintln(w, "User deleted successfully!!!")
	}
}

func UserUpdateUsernameController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var newUserData model.UpdateUserInfo
		decodeRequestBodyErr := json.Unmarshal(r_body, &newUserData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body (update uname)") {
			return
		}
		var oldUsername string = r.Context().Value("username").(string)
		_, updateUsernameError := conn.Exec(context.Background(), "UPDATE user_data SET username=$1 WHERE username=$2", newUserData.NewUsername, oldUsername)
		if utilErrorReturn(updateUsernameError, &w, http.StatusInternalServerError, "Error updating username") {
			return
		}
		fmt.Fprintln(w, "Username updated successfully!!!")
	}
}

func UserUpdatePasswordController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var newUserData model.UpdateUserInfo
		decodeRequestBodyErr := json.Unmarshal(r_body, &newUserData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		bytePassword, encryptionError := bcrypt.GenerateFromPassword([]byte(newUserData.NewPassword), EncryptCost)
		if utilErrorReturn(encryptionError, &w, http.StatusInternalServerError, "Error in password encryption") {
			return
		}
		var username string = r.Context().Value("username").(string)
		var password string = string(bytePassword)
		_, updatePasswordError := conn.Exec(context.Background(), "UPDATE user_data SET password=$1 WHERE username=$2", password, username)
		if utilErrorReturn(updatePasswordError, &w, http.StatusInternalServerError, "Error updating password") {
			return
		}
		fmt.Fprintln(w, "Password updated successfully!!!")
	}
}

func GetUserPagesController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username, success := r.Context().Value("username").(string)
		if !success {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprintln(w, "can't get username")
			return
		}
		pages := []model.Page{}
		pageRows, err := conn.Query(context.Background(), "SELECT * FROM page WHERE user_id = (SELECT user_id FROM user_data WHERE username = $1)", username)
		if utilErrorReturn(err, &w, http.StatusInternalServerError, "") {
			return
		}
		var currentPage model.Page
		for pageRows.Next() {
			pageRows.Scan(&currentPage.PageId, &currentPage.UserId, &currentPage.Title, &currentPage.Content)
			pages = append(pages, currentPage)
		}
		pageRows.Close()
		if utilErrorReturn(pageRows.Err(), &w, http.StatusInternalServerError, "rows fetch error") {
			return
		}
		responseContent := map[string]any{
			"message": "pages fetched successfully!!!",
			"pages":   pages,
		}
		// utilSuccess(&w, http.StatusOK, responseContent)
		jsonData, jsonMarshalError := json.Marshal(responseContent)
		if utilErrorReturn(jsonMarshalError, &w, http.StatusInternalServerError, "Internal server error") {
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
		return
	}
}

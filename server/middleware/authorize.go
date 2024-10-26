package middleware

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
)

func AuthorizeUser(next http.HandlerFunc, conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		/// Bearer <access-token>
		authorizeHeader := r.Header.Get("Authorization")
		if authorizeHeader == "" || len(authorizeHeader) < 8 {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		accessToken := authorizeHeader[7:]
		jwtToken, jwtParseError := jwt.Parse(accessToken, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				fmt.Println("Unexpected signing method")
				return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SIGNARUTE")), nil
		})
		if utilErrorReturn(jwtParseError, &w, http.StatusUnauthorized, "Error parsing the JWT Token") {
			return
		}
		claims, isClaimFetched := jwtToken.Claims.(jwt.MapClaims)
		if utilBoolReturn(isClaimFetched, &w, http.StatusUnauthorized, "Error fetching JWT Token claims") {
			return
		}
		expDateTime, expireTimeError := claims.GetExpirationTime()
		if expireTimeError == nil && expDateTime.Compare(time.Now()) == -1 {
			expireTimeError = fmt.Errorf("jwt token expired")
		}
		if utilErrorReturn(expireTimeError, &w, http.StatusUnauthorized, "JWT Token expired") {
			return
		}
		username, isUsernameFetched := claims["username"].(string)
		if utilBoolReturn(isUsernameFetched, &w, http.StatusNonAuthoritativeInfo, "Error fetching username") {
			return
		}
		r = r.WithContext(context.WithValue(r.Context(), "username", username))
		next(w, r)
	}
}

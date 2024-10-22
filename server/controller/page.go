package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/melsonic/syncpad/model"
)

func PageCreateController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var pageData model.Page
		decodeRequestBodyErr := json.Unmarshal(r_body, &pageData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		// check if page with same title exist
		rows, fetchPageError := conn.Query(context.Background(), `SELECT * FROM page WHERE title = $1 OR title ~ ('^' || $1 || '( \([0-9]+\))?$')`, pageData.Title)
		if utilErrorReturn(fetchPageError, &w, http.StatusInternalServerError, "Internal server error") {
			return
		}
		var rowsFetched int = hasRows(rows)
		if rowsFetched != 0 {
			pageData.Title = fmt.Sprintf("%s (%d)", pageData.Title, rowsFetched)
		}
		fetchUserIdError := conn.QueryRow(context.Background(), "SELECT user_id FROM user_data WHERE username=$1", r.Context().Value("username").(string)).Scan(&pageData.UserId)
		if utilErrorReturn(fetchUserIdError, &w, http.StatusInternalServerError, "Error fetching userId") {
			return
		}
		// insert page into the page table
		_, insertPageError := conn.Exec(context.Background(), "INSERT INTO page (user_id, title, content) VALUES ($1, $2, $3)", pageData.UserId, pageData.Title, pageData.Content)
		if utilErrorReturn(insertPageError, &w, http.StatusInternalServerError, "Error inserting page") {
			return
		}
		fetchPageIdError := conn.QueryRow(context.Background(), "SELECT page_id FROM page WHERE user_id=$1 AND title=$2", pageData.UserId, pageData.Title).Scan(&pageData.PageId)
		if utilErrorReturn(fetchPageIdError, &w, http.StatusInternalServerError, "Error fetching pageId") {
			return
		}
		responseData := map[string]any{
			"message": "Page created successfully",
			"page_id": pageData.PageId,
			"title":   pageData.Title,
			"content": pageData.Content,
		}
		jsonData, jsonMarshalError := json.Marshal(responseData)
		if utilErrorReturn(jsonMarshalError, &w, http.StatusInternalServerError, "Internal server error") {
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
		return
	}
}

func PageDeleteController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var pageData model.Page
		decodeRequestBodyErr := json.Unmarshal(r_body, &pageData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		dm, deletePageError := conn.Exec(context.Background(), "DELETE FROM page WHERE page_id=$1", pageData.PageId)
		if utilErrorReturn(deletePageError, &w, http.StatusInternalServerError, "Error deleting page") {
			return
		}
		if dm.RowsAffected() == 0 {
			fmt.Fprintln(w, "page doesn't exist")
			return
		}
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, "page deleted!!!")
	}
}

func PageUpdateTitleController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var pageData model.Page
		decodeRequestBodyErr := json.Unmarshal(r_body, &pageData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		pgxCommandTag, updateTitleError := conn.Exec(context.Background(), "UPDATE page SET title=$1 WHERE page_id=$2", pageData.Title, pageData.PageId)
		if utilErrorReturn(updateTitleError, &w, http.StatusInternalServerError, "Error updating titme") {
			return
		}
		if pgxCommandTag.RowsAffected() == 0 {
			fmt.Fprintln(w, "page doesn't exist")
			return
		}
		fmt.Fprintln(w, "Page title updated successfully!!!")
	}
}

func PageUpdateContentController(conn *pgx.Conn) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r_body, readBodyError := io.ReadAll(r.Body)
		if utilErrorReturn(readBodyError, &w, http.StatusBadRequest, "Error reading request body") {
			return
		}
		var pageData model.Page
		decodeRequestBodyErr := json.Unmarshal(r_body, &pageData)
		if utilErrorReturn(decodeRequestBodyErr, &w, http.StatusBadRequest, "Error decoding request body") {
			return
		}
		pgxCommandTag, updateContentError := conn.Exec(context.Background(), "UPDATE page SET content=$1 WHERE page_id=$2", pageData.Content, pageData.PageId)
		if utilErrorReturn(updateContentError, &w, http.StatusInternalServerError, "Error updating content") {
			return
		}
		if pgxCommandTag.RowsAffected() == 0 {
			fmt.Fprintln(w, "page doesn't exist")
			return
		}
		fmt.Fprintln(w, "Page content updated successfully!!!")
	}
}

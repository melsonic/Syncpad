package controller

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5"
)

const EncryptCost = 10

func hasRows(rows pgx.Rows) int {
	var cnt int = 0
	for rows.Next() {
		cnt = cnt + 1
	}
	rows.Close()
	err := rows.Err()
	if err != nil {
		return 0
	}
	return cnt
}

func utilErrorReturn(inputErr error, w *http.ResponseWriter, statusCode int, message string) bool {
	if inputErr != nil {
		(*w).WriteHeader(statusCode)
		fmt.Fprintln(*w, fmt.Sprintf("%s : %s", message, inputErr))
		return true
	}
	return false
}

func utilBoolReturn(check bool, w *http.ResponseWriter, statusCode int, message string) bool {
	if check {
		(*w).WriteHeader(statusCode)
		fmt.Fprintln(*w, fmt.Sprintf("%s", message))
		return true
	}
	return false
}

func utilSuccess(w *http.ResponseWriter, statusCode int, message map[string]any) {
	jsonData, jsonMarshalError := json.Marshal(message)
	if utilErrorReturn(jsonMarshalError, w, http.StatusInternalServerError, "Internal server error") {
		return
	}
	// (*w).WriteHeader(statusCode)
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
	(*w).Header().Set("Content-Type", "application/json")
	(*w).Write(jsonData)
}

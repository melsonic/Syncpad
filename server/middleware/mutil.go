package middleware

import (
	"fmt"
	"net/http"
)

func utilErrorReturn(inputErr error, w *http.ResponseWriter, statusCode int, message string) bool {
	if inputErr != nil {
		(*w).WriteHeader(statusCode)
		fmt.Fprintln(*w, fmt.Sprintf("%s : %s", message, inputErr))
		return true
	}
	return false
}

func utilBoolReturn(check bool, w *http.ResponseWriter, statusCode int, message string) bool {
	if !check {
		(*w).WriteHeader(statusCode)
		fmt.Fprintln(*w, fmt.Sprintf("%s", message))
		return true
	}
	return false
}

package model

type User struct {
	UserId   int    `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

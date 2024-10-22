package model

type Page struct {
	PageId  int    `json:"page_id"`
	UserId  int    `json:"user_id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

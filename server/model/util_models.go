package model

type UpdateUserInfo struct {
  NewUsername string `json:"new_username"`
  NewPassword string `json:"new_password"`
}


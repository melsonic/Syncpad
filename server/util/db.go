package util

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
)

func SetupDB(conn *pgx.Conn) {
  _, err := conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS user_data (
      user_id SERIAL PRIMARY KEY,
      email varchar(255) NOT NULL UNIQUE,
      username varchar(255) NOT NULL UNIQUE,
      password varchar(255) NOT NULL
    )
  `)
	if err != nil {
		log.Fatalln("Error creating table USER")
	}
	_, err = conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS page (
      page_id SERIAL PRIMARY KEY,
      user_id integer REFERENCES USER_DATA(user_id),
      title varchar(255) NOT NULL UNIQUE,
      content text
    )
  `)
	if err != nil {
		log.Fatalln("Error creating table PAGE")
	}
}
































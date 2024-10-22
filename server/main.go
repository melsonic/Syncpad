package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
	"github.com/melsonic/syncpad/util"
	"github.com/rs/cors"
)

func main() {
	envMapError := godotenv.Load(".env")
	if envMapError != nil {
		log.Fatalln("Error loading `.env` file")
	}
	conn, err := pgx.Connect(context.Background(), os.Getenv("DB_CONN_STR"))
	if err != nil {
		log.Fatalln("Error connecting to database")
	}
	defer conn.Close(context.Background())
	util.SetupDB(conn)
	router := util.SetupServeMux(conn)
	// c := cors.New(cors.Options{})
	var srv *http.Server = &http.Server{
		Addr:    fmt.Sprintf(":%s", os.Getenv("PORT")),
		Handler: cors.AllowAll().Handler(router),
	}
	log.Fatal(srv.ListenAndServe())
}

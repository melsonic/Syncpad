package util

import (
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5"
	"github.com/melsonic/syncpad/controller"
	"github.com/melsonic/syncpad/middleware"
)

func SetupServeMux(conn *pgx.Conn) *http.ServeMux {
	var router *http.ServeMux = http.NewServeMux()

	/// default home handler
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello From Server")
	})

	/// USER
	/// user create
	router.HandleFunc("/user/create", controller.UserCreateController(conn))
	/// user login
	router.HandleFunc("/user/login", controller.UserLoginController(conn))
	/// user Authorize
	router.HandleFunc("/user/authorize", controller.UserAuthorize(conn))
	/// user delete
	router.HandleFunc("/user/delete", middleware.AuthorizeUser(controller.UserDeleteController(conn), conn))
	/// username update
	router.HandleFunc("/user/update/username", middleware.AuthorizeUser(controller.UserUpdateUsernameController(conn), conn))
	/// password update
	router.HandleFunc("/user/update/password", middleware.AuthorizeUser(controller.UserUpdatePasswordController(conn), conn))
	/// get user pages
	router.HandleFunc("/user/pages", middleware.AuthorizeUser(controller.GetUserPagesController(conn), conn))

	/// PAGE
	/// page create
	router.HandleFunc("/page/create", middleware.AuthorizeUser(controller.PageCreateController(conn), conn))
	/// page delete
	router.HandleFunc("/page/delete", middleware.AuthorizeUser(controller.PageDeleteController(conn), conn))
	/// page title update
	router.HandleFunc("/page/update/title", middleware.AuthorizeUser(controller.PageUpdateTitleController(conn), conn))
	/// page content update
	router.HandleFunc("/page/update/content", middleware.AuthorizeUser(controller.PageUpdateContentController(conn), conn))

	return router
}

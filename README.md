## Syncpad
Welcome to Syncpad, a simple note taking app.

### Architecture
```
-----------------                   -----------------                                                                                          
|               |                   |               |                                                                                          
|     client    | --------------->  |     server    |                                                                                                           
|               |                   |               |                                                                                          
-----------------                   -----------------                                                                                          
```

### Technology Used

**FrontEnd**
- React
- React Router
- Tailwind CSS

**BackEnd**
- Golang (net/http)
- PostgreSQL (database)
- pgx (PostgreSQL Driver for Go)

### Features Implemented
- Basic Authorization & Authentication Workflow
- CRUD operation on pages
- Save pages on exit

### TODO
- Optimize saving page content in database.
- Optimize autosaving notes process.
- Make UI more intuitive.
- Containerize the Application.

### Run the application
- Create a PostgreSQL database(either local or from any service)
- create `.env` file from `.env.example`
    - `cp ./server/.env.example ./server/.env`
    - update the contents (if you edit port, also update it in the `./client/src/constants.ts` also)
- start server
    - `cd ./server && make`
- start UI 
    - `cd ./client && yarn dev`
- voila!!! enjoy using Syncpad 🎉 

# Web-Application-Project Group 10

## (EDIT: 27.11.2025)
Our web application doesn't work no longer due to finnkino API changes and backend not being on. However you can still visit the site and see the application's information down below and other documentation!

## MadMooseMovies
A movie web application built with React, Express, and PostgreSQL. Users can sign up, log in, review movies, manage favorites, join groups, and upload profile pictures.

[MadMooseMovies](https://websovellus-projekti-ryhma-10-front.onrender.com/) <-- Find our web application here!

## Features

- **User Authentication:** Sign up, sign in, and delete account.
- **Profile Management:** Upload and display profile pictures.
- **Movie Reviews:** Add reviews with star ratings and comments.
- **Movie Search:** Search movies from tmdb with name, genre and release year. Search movies from finnkino with name, theatre and showtime.
- **Favorites:** Mark movies as favorites and share favorites.
- **Groups:** Create and join groups, manage group memberships.
- **Group Movies:** Add movies to groups with notes and ratings.

## Extra Features
- **Animation:** Various animations on our page on headers etc.
- **Finnkino search with 3 criterias:** Finnkino search with title, theatre and showtime.
- **Profile picture:** Users can add profile pictures to profile page.
- **Movie Carousels:** Popular & Now in theatres carousels for each search to highlight trending movies.
- **Username:** Users may register and sign in with username. Username will be shown on posts and reviews instead of email.

## Technologies

- **Frontend:** React (Vite)
- **Backend:** Express (Node.js)
- **Database:** PostgreSQL
- **Testing:** Mocha, Supertest, Postman

## Project Structure

```
web/
  ├── server/         # Express backend
  │   ├── models/     # Database models
  │   ├── routes/     # API routes
  │   ├── controllers/# Route controllers
  │   ├── moviedb.sql # Database schema
  │   └── index.js    # Server entry point
  └── src/            # React frontend
      ├── screens/    # Page components (Profile, etc.)
      ├── assets/
      └── components/
```

## Wireframe

![Wireframe](web/src/assets/wireframe.png)

## Database Schema Overview

- **users:** Stores user info and profile picture URL.
- **reviews:** User reviews for movies.
- **user_favorites:** Favorite movies per user.
- **groups:** Movie groups.
- **group_memberships:** Group membership and roles.
- **group_movies:** Movies added to groups.

![Databasediagram](web/src/assets/tietokantakaavio.png)
---

## Documentations

Tests were done in Postman 

[Tests here](https://documenter.getpostman.com/view/48990018/2sB3QJQBnL)

[Backlog here](https://github.com/orgs/Ryhma10/projects/1)

[Work hours here](https://unioulu-my.sharepoint.com/:x:/g/personal/t3rosa01_students_oamk_fi/Eci2o0QBeK9EmDaI_gvUpSkBmReBRgEO9hzHQ_K3Yl5zDg?e=Q9Xu8E)

[Powerpoint presentation here](https://1drv.ms/p/c/61ab208d4fe3fd9c/EZZyyD8QAEpEvy9jYdZuxP8B2fAUsDTQuXYnapdoaZe-bA?e=b9qPhH)

---

**Group 10**  
Jesse Hirvonen, Merja Sotkasiira, Salla-Mari Rokkonen, Tommy Näsänen, Anna Seppänen

Oulu University of Applied Sciences  
2025

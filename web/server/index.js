import express from 'express'   //endpointtien (reitit) määrittelyyn
import cors from 'cors'            
import 'dotenv/config'          //ympäristömuuttujien käyttöä varten
import { pool } from '../server/helper/db.js'
import userRouter from './routes/UserRouter.js'
import reviewRouter from './routes/reviewRouter.js'
import FavoriteRouter from './routes/FavoritesRouter.js'
import TmdbRouter from './routes/TmdbRouter.js'
import groupRouter from './routes/GroupRouter.js'
import GroupMoviesRouter from "./routes/GroupMoviesRouter.js"

const PORT = process.env.PORT || 3001 //Express-palvelin käynnistetään portissa 3001           

const app = express()           //luodaan Express-sovellus

//Middlewaret kaikille pyynnöille
app.use(cors())                 //sallitaan CORS
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

//Reitit
app.use('/api/users', userRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/user_favorites', FavoriteRouter)
app.use('/api/tmdb', TmdbRouter)
app.use("/api/favorites", FavoriteRouter)
app.use('/api/groups', groupRouter)
app.use('/api/group_movies', GroupMoviesRouter)

app.listen(PORT, () => {          //käynnistetään palvelin
    console.log(`Server is running on http://localhost:${PORT} (env PORT=${process.env.PORT})`)
})

// server/index.js – lisää ihan loppuun ennen exporttia
app.use((err, req, res, next) => {
  console.error("ERROR:", {
    path: req.path,
    method: req.method,
    msg: err.message,
    code: err.code,
    detail: err.detail,
    stack: err.stack
  })
  res.status(err.status || 500).json({ error: err.message, code: err.code, detail: err.detail })
})

export default app
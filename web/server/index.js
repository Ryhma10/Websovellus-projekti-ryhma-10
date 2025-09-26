import express from 'express'   //endpointtien (reitit) määrittelyyn
import cors from 'cors'         //sallii pyynnöt eri porteista (myöh. domaineista)           
import 'dotenv/config'          //ympäristömuuttujien käyttöä varten
import { pool } from '../server/helper/db.js'
import userRouter from './routes/UserRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import FavoriteRouter from './routes/FavoritesRouter.js';
import ApiRouter from './routes/ApiRouter.js'; 

const PORT = process.env.PORT || 3001 //Express-palvelin käynnistetään portissa 3001           

const app = express()           //luodaan Express-sovellus

//Middlewaret kaikille pyynnöille
app.use(cors())                 //sallitaan CORS
app.use(express.json())         //parsitaan application/json-rungot req.bodyyn
app.use(express.urlencoded({extended: false})) //parsii lomakepostit (application/x-form-urlencoded). extended:false = perusparseri

app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/user_favorites', FavoriteRouter);
app.use('/api/apis', ApiRouter);

app.listen(PORT, () => {          //käynnistetään palvelin
    console.log(`Server is running on http://localhost:${PORT} (env PORT=${process.env.PORT})`)
})
import express from 'express'   //endpointtien (reitit) määrittelyyn
import cors from 'cors'         //sallii pyynnöt eri porteista (myöh. domaineista)           
import 'dotenv/config'          //ympäristömuuttujien käyttöä varten
import { pool } from '../server/helper/db.js'
import userRouter from './routes/userRouter.js';


const PORT = process.env.PORT  //Express-palvelin käynnistetään portissa 3001           

const app = express()           //luodaan Express-sovellus

//Middlewaret kaikille pyynnöille
app.use(cors())                 //sallitaan CORS
app.use(express.json())         //parsitaan application/json-rungot req.bodyyn
app.use(express.urlencoded({extended: false})) //parsii lomakepostit (application/x-form-urlencoded). extended:false = perusparseri

app.get('/', (req,res) => {     //tehdään GET-kutsu, jossa haetaan kaikki käyttäjät

    pool.query('SELECT * from users', (err, result) => {
        if(err) {
            return res.status(500).json({error: err.message})
        }
        res.status(200).json(result.rows)
    })
})

app.use('/api/users', userRouter);

app.listen(PORT, () => {          //käynnistetään palvelin
    console.log(`Server is running on http://localhost:${PORT}`)
})
import express from 'express'   //endpointtien (reitit) määrittelyyn
import cors from 'cors'         //sallii pyynnöt eri porteista (myöh. domaineista)
import pkg from 'pg'            //postgresiin liittämiseen Poolilla
import 'dotenv/config'          //ympäristömuuttujien käyttöä varten

const PORT = process.env.PORT || 3001  //Express-palvelin käynnistetään portissa 3001
const { Pool } = pkg            //otetaan Pool (yhteyspooli) pg-paketista

const app = express()           //luodaan Express-sovellus

//Middlewaret kaikille pyynnöille
app.use(cors())                 //sallitaan CORS
app.use(express.json())         //parsitaan application/json-rungot req.bodyyn
app.use(express.urlencoded({extended: false})) //parsii lomakepostit (application/x-form-urlencoded). extended:false = perusparseri

const openDb = () => {          //tehdään tietokannan avaamiselle oma funktio, jota voi kutsua muualtakin
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'movie',
        password: process.env.PGPASSWORD, //tehdään oma .env tiedosto server-kansioon, johon määritetään PGPASSWORD=omasalasanasi
        port: 5432
    })
    return pool
}

app.get('/', (req,res) => {     //tehdään GET-kutsu, jossa 
    const pool = openDb()

    pool.query('SELECT * from users', (err, result) => {
        if(err) {
            return res.status(500).json({error: err.message})
        }
        res.status(200).json(result.rows)
    })
})

app.listen(port, () => {          //käynnistetään palvelin
    console.log(`Server is running on http://localhost:${port}`)
})
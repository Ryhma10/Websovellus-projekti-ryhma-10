import pkg from 'pg'        //postgresiin liittämiseen Poolilla
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT

const { Pool } = pkg        //otetaan Pool (yhteyspooli) pg-paketista

const openDb = () => {      //yhdistetään tietokantaan .envissä olevilla tiedoilla
    const pool = new Pool({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGNAME,
        password: process.env.PGPASSWORD,  //.enviin PGPASSWORD=omasalasanasi
        port: process.env.PGPORT
    })
    return pool
}

const pool = openDb()

export { pool }
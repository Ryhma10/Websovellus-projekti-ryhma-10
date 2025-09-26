import request from 'supertest'; //Tuodaan Supertest HTTP-pyyntöjen tekemiseen
import { expect } from 'chai'; //Tuodaan Chai odotusten tekemiseen
import app from '../index.js'; //Tuodaan Express-sovellus

//Testikokonaisuus käyttäjän autentikoinnille
describe('Auth API', () => { //Testi: rekisteröityminen onnistuu oikeilla tiedoilla
    it('Kirjautuminen onnistuu oikeilla tunnuksilla', async () => { // Luodaan satunnainen tunniste, jotta käyttäjänimi ja email on uniikkeja
        const random = Math.floor(Math.random() * 100000); //Lähetetään POST-pyyntö /api/users/sing-up reitille
        const res = await request(app)
            .post('/api/users/signup')
            .send({ 
                username: `testi${random}`, // satunnainen käyttäjänimi
                email: `testi${random}@example.com`, // satunnainen sähköposti
                password: 'Salasana1' // vähintään 8 merkkiä, iso kirjain ja numero!
            });
        expect(res.status).to.equal(201); //Varmistetaan, että vastaus on 201 (Created)
        expect(res.body).to.have.property('username', `testi${random}`); //Varmistetaan, että vastauksessa on oikea käyttäjänimi
    });
});
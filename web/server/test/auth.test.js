import request from 'supertest'; //Tuodaan Supertest HTTP-pyyntöjen tekemiseen
import { expect } from 'chai'; //Tuodaan Chai odotusten tekemiseen
import app from '../index.js'; //Tuodaan Express-sovellus

//Testi: Rekisteröityminen onnistuu oikeilla tunnuksilla
describe('Auth API', () => { //Rekisteröityminen onnistuu oikeilla tunnuksilla
    it('Rekisteröityminen onnistuu oikeilla tunnuksilla', async () => { 
        //Satunnainen tunnus, jotta testiä voi ajaa monta kertaa
        const random = Math.floor(Math.random() * 100000); 
        //Lähetetään rekisteröitymispyyntö /signup reitille
        const res = await request(app)
            .post('/api/users/signup')
            .send({ 
                username: `testi${random}`,
                email: `testi${random}@example.com`,
                password: 'Salasana1'
            });
        expect(res.status).to.equal(201); //Tarkistetaan, että vastauskoodi on 201 Created
        expect(res.body).to.have.property('username', `testi${random}`); //Tarkistetaan, että palautettu käyttäjänimi on oikein
    });

    //Testi: Kirjautuminen onnistuu oikeilla tunnuksilla
    it('Kirjautuminen onnistuu oikeilla tunnuksilla', async () => { 
        //Satunnainen tunnus
        const random = Math.floor(Math.random() * 100000);
        const username = `testi${random}`;
        const email = `testi${random}@example.com`;
        const password = 'Salasana1';

        // Rekisteröidään käyttäjä ensin
        await request(app)
            .post('/api/users/signup')
            .send({ username, email, password });

        // Testataan kirjautuminen
        const res = await request(app)
            .post('/api/users/signin')
            .send({ username, password });

        //Tarkistetaan, että vastauskoodi on 200 OK
        expect(res.status).to.equal(200);
        //Tarkistetaan, että token palautuu
        expect(res.body).to.have.property('token');
        //Tarkistetaan, että sähköposti on oikein
        expect(res.body).to.have.property('email', email);
    });

    //Testi: Uloskirjautuminen onnistuu
    it('Uloskirjautuminen onnistuu', async () => {
        //Satunnainen tunnus
        const random = Math.floor(Math.random() * 100000);
        const username = `testi${random}`;
        const email = `testi${random}@example.com`;
        const password = 'Salasana1';

        // Rekisteröi käyttäjä
        await request(app)
            .post('/api/users/signup')
            .send({ username, email, password });

        // Kirjaudu ja tallenna token
        const loginRes = await request(app)
            .post('/api/users/signin')
            .send({ username, password });
        const token = loginRes.body.token;

        // Testaa uloskirjautuminen, token vaaditaan
        const res = await request(app)
            .post('/api/users/logout')
            .set('Authorization', `Bearer ${token}`);

        //Tarkistetaan, että vastauskoodi on 200 OK
        expect(res.status).to.equal(200);
    });

    //Testi: Rekisteröidyn käyttäjän tilin poisto onnistuu
    it('Rekisteröidyn käyttäjän tilin poisto onnistuu', async () => {
        //Satunnainen tunnus
        const random = Math.floor(Math.random () * 100000);
        const username = `testi${random}`;
        const email = `testi${random}@example.com`;
        const password = 'Salasana1';

        //Rekisteröi käyttäjä
        await request(app)
        .post('/api/users/signup')
        .send({username, email, password});

        //Kirjaudu ja tallenna token
        const loginRes = await request(app)
        .post('/api/users/signin')
        .send({username, password});
        const token = loginRes.body.token;

        //Poista käyttäjä
        const res = await request(app)
        .delete('/api/users/delete')
        .set('Authorization', `Bearer ${token}`)
        .send({username});
        
        
        //Tarkistetaan, että vastauskoodi on 200 OK (204, jos jo käytössä)
        expect([200,204]).to.include(res.status);
    })

});
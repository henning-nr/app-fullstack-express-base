var express = require('express');
var router = express.Router();

const url = "https://ubiquitous-dollop-pj74g4vrj7qvh6q47-4000.app.github.dev/auth/login";


router.get('/', function (req, res, next) {
    res.render('pages/login', {  title: 'Express', error: ''});
});

router.post('/', (req, res) => {
    const { username, password } = req.body;
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(async (res) => {
        if (!res.ok) {
            const err = await res.json();
            console.log('err', err);
            throw err;
        }
        return res.json();
    })
    .then((data) => {
        console.log('veio', data);
        req.session.token = data.token;
        res.redirect('/users');
    })
    .catch((error) => {
        console.log('Erro', error);
        res.render('layout', { body: 'pages/login', title: 'Express', error });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.render('layout', { body: 'pages/login', title: 'Express', error: 'Logout failed, please try again.' });
        }
        res.redirect('/');
    });
});

module.exports = router;

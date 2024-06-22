var express = require('express');
var router = express.Router();

const url = "https://ubiquitous-dollop-pj74g4vrj7qvh6q47-4000.app.github.dev/auth/login";

/* GET home page. /


/ GET logout */
router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.render('layout', { body: 'pages/login', title: 'Express', error: 'Logout failed, please try again.' });
        }
        res.redirect('/');
    });
});

module.exports = router;

var express = require('express');
var router = express.Router();

const url = "https://symmetrical-space-parakeet-wr9rw66gxvjq29p7p-4000.app.github.dev/auth/login";

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

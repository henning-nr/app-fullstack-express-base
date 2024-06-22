var express = require('express');
var router = express.Router();
const url = "https://symmetrical-space-parakeet-wr9rw66gxvjq29p7p-4000.app.github.dev/games/"

/* GET games listing. */
router.get('/', function (req, res, next) {
  let title = "Gestão de Jogos"
  let cols = ["Id", "Nome", "Preço", "Data", "Ações"]
  const token = req.session.token || ""
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json()
        throw err
      }
      return res.json()
    })
    .then((games) => {
      res.render('layout', { body: 'pages/games', title, games, cols, error: "" })
    })
    .catch((error) => {
      console.log('Erro', error)
      res.redirect('/login')
    })
});

// POST new game
router.post("/", (req, res) => {
  const { name, price, date } = req.body
  const token = req.session.token || ""
  fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`
     },
    body: JSON.stringify({ name, price, date })
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json()
      throw err
    }
    return res.json()
  })
    .then((game) => {
      res.send(game)
    })
    .catch((error) => {
      res.status(500).send(error)
    })
})

// UPDATE game
router.put("/:id", (req, res) => {
  const { id } = req.params
  const { name, price, date } = req.body
  const token = req.session.token || ""
  fetch(url + id, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`
     },
    body: JSON.stringify({ name, price, date })
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json()
      throw err
    }
    return res.json()
  })
    .then((game) => {
      res.send(game)
    })
    .catch((error) => {
      res.status(500).send(error)
    })
})

// REMOVE game
router.delete("/:id", (req, res) => {
  const { id } = req.params
  const token = req.session.token || ""
  fetch(url + id, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json()
      throw err
    }
    return res.json()
  })
    .then((game) => {
      res.send(game)
    })
    .catch((error) => {
      res.status(500).send(error)
    })
})

// GET game by id
router.get("/:id", (req, res) => {
  const { id } = req.params
  const token = req.session.token || ""
  fetch(url + id, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json()
      throw err
    }
    return res.json()
  })
    .then((game) => {
      res.send(game)
    })
    .catch((error) => {
      res.status(500).send(error)
    })
})

module.exports = router;
// oi bom dia 
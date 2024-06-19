const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const verifyJWT = require('../auth/verify-token');

const db = new sqlite3.Database('./database/database.db');

// CRIANDO TABELA GAMES
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    date TEXT
  )
`, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela games:', err);
  } else {
    console.log('Tabela games criada com sucesso!');
  }
});

// Função auxiliar para execução de queries
const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Função auxiliar para busca de dados
const getQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Função auxiliar para busca de múltiplos dados
const allQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/* POST create a new game. */
router.post('/', verifyJWT, async (req, res) => {
  const { name, price, date } = req.body;

  try {
    await runQuery('INSERT INTO games (name, price, date) VALUES (?, ?, ?)', [name, price, date]);
    console.log("Game criado com sucesso:", name);
    res.status(201).send({ message: "Game criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar o game:", error);
    res.status(500).send({ error: 'Erro ao criar o game' });
  }
});

/* GET games listing. */
router.get('/', verifyJWT, async (req, res) => {
  try {
    const games = await allQuery('SELECT * FROM games', []);
    res.status(200).send(games);
  } catch (error) {
    console.error("Erro ao buscar games:", error);
    res.status(500).send({ error: "Erro ao buscar games" });
  }
});

/* GET single game by ID. */
router.get('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const game = await getQuery('SELECT * FROM games WHERE id = ?', [id]);
    if (!game) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    res.status(200).json(game);
  } catch (error) {
    console.error('Erro ao buscar game:', error);
    res.status(500).json({ error: 'Erro ao buscar game' });
  }
});

/* PUT update a game. */
router.put('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { name, price, date } = req.body;

  try {
    const result = await runQuery('UPDATE games SET name = ?, price = ?, date = ? WHERE id = ?', [name, price, date, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    res.status(200).json({ message: "Game atualizado com sucesso" });
  } catch (error) {
    console.error('Erro ao atualizar game:', error);
    res.status(500).json({ error: 'Erro ao atualizar game' });
  }
});

/* PATCH partially update a game. */
router.patch('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo fornecido para atualização' });
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');

  try {
    const result = await runQuery(`UPDATE games SET ${setClause} WHERE id = ?`, [...values, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    res.status(200).json({ message: "Game atualizado parcialmente com sucesso" });
  } catch (error) {
    console.error('Erro ao atualizar game parcialmente:', error);
    res.status(500).json({ error: 'Erro ao atualizar game parcialmente' });
  }
});

/* DELETE a game. */
router.delete('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await runQuery('DELETE FROM games WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Game não encontrado' });
    }
    res.status(200).json({ message: "Game deletado com sucesso" });
  } catch (error) {
    console.error('Erro ao deletar game:', error);
    res.status(500).json({ error: 'Erro ao deletar game' });
  }
});

module.exports = router;

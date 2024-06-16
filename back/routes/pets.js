const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const verifyJWT = require('../auth/verify-token');

const db = new sqlite3.Database('./database/database.db');

// CRIANDO TABELA PETS
db.run(`
  CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    race TEXT,
    colour TEXT,
    gender TEXT
  )
`, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela pets:', err);
  } else {
    console.log('Tabela pets criada com sucesso!');
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

/* POST create a new pet. */
router.post('/', verifyJWT, async (req, res) => {
  const { name, race, colour, gender } = req.body;

  try {
    await runQuery('INSERT INTO pets (name, race, colour, gender) VALUES (?, ?, ?, ?)', [name, race, colour, gender]);
    console.log("Pet criado com sucesso:", name);
    res.status(201).send({ message: "Pet criado com sucesso" });
  } catch (error) {
    console.error("Erro ao criar o pet:", error);
    res.status(500).send({ error: 'Erro ao criar o pet' });
  }
});

/* GET pets listing. */
router.get('/', verifyJWT, async (req, res) => {
  try {
    const pets = await allQuery('SELECT * FROM pets', []);
    res.status(200).send(pets);
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    res.status(500).send({ error: "Erro ao buscar pets" });
  }
});

/* GET single pet by ID. */
router.get('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await getQuery('SELECT * FROM pets WHERE id = ?', [id]);
    if (!pet) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    res.status(200).json(pet);
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    res.status(500).json({ error: 'Erro ao buscar pet' });
  }
});

/* PUT update a pet. */
router.put('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;
  const { name, race, colour, gender } = req.body;

  try {
    const result = await runQuery('UPDATE pets SET name = ?, race = ?, colour = ?, gender = ? WHERE id = ?', [name, race, colour, gender, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    res.status(200).json({ message: "Pet atualizado com sucesso" });
  } catch (error) {
    console.error('Erro ao atualizar pet:', error);
    res.status(500).json({ error: 'Erro ao atualizar pet' });
  }
});

/* PATCH partially update a pet. */
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
    const result = await runQuery(`UPDATE pets SET ${setClause} WHERE id = ?`, [...values, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    res.status(200).json({ message: "Pet atualizado parcialmente com sucesso" });
  } catch (error) {
    console.error('Erro ao atualizar pet parcialmente:', error);
    res.status(500).json({ error: 'Erro ao atualizar pet parcialmente' });
  }
});

/* DELETE a pet. */
router.delete('/:id', verifyJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await runQuery('DELETE FROM pets WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }
    res.status(200).json({ message: "Pet deletado com sucesso" });
  } catch (error) {
    console.error('Erro ao deletar pet:', error);
    res.status(500).json({ error: 'Erro ao deletar pet' });
  }
});

module.exports = router;

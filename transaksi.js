const express = require('express');
const connection = require('./db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// CREATE (Insert transaksi)
app.post('/transaksi', (req, res) => {
  const { id_produk, jenis_transaksi } = req.body;

  const queryInsert = `
    INSERT INTO Transaksi (id_produk, jenis_transaksi)
    VALUES (?, ?)
  `;

  const queryUpdateStock = `
    UPDATE Produk
    SET stock = stock ${jenis_transaksi === 'masuk' ? '+' : '-'} 1
    WHERE id_produk = ?
  `;

  connection.beginTransaction((err) => {
    if (err) throw err;

    connection.query(queryInsert, [id_produk, jenis_transaksi], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      }

      connection.query(queryUpdateStock, [id_produk], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          res.status(201).json({ message: 'Transaction added and stock updated successfully!', results });
        });
      });
    });
  });
});

// READ (Get all transactions)
app.get('/transaksi', (req, res) => {
  connection.query('SELECT * FROM Transaksi', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// UPDATE (Not typically used for transactions, but here's an example)
app.put('/transaksi/:id', (req, res) => {
  const { id } = req.params;
  const { id_produk, jenis_transaksi } = req.body;

  const queryUpdate = `
    UPDATE Transaksi 
    SET id_produk = ?, jenis_transaksi = ?
    WHERE id_transaksi = ?
  `;

  connection.query(queryUpdate, [id_produk, jenis_transaksi, id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Transaction updated successfully!', results });
    }
  });
});

// DELETE (Delete transaksi by id)
app.delete('/transaksi/:id', (req, res) => {
  const { id } = req.params;

  const queryGetTransaksi = `
    SELECT id_produk, jenis_transaksi
    FROM Transaksi
    WHERE id_transaksi = ?
  `;

  const queryDelete = `
    DELETE FROM Transaksi WHERE id_transaksi = ?
  `;

  connection.beginTransaction((err) => {
    if (err) throw err;

    connection.query(queryGetTransaksi, [id], (err, results) => {
      if (err || results.length === 0) {
        return connection.rollback(() => {
          res.status(500).json({ error: err ? err.message : 'Transaction not found' });
        });
      }

      const { id_produk, jenis_transaksi } = results[0];

      const queryUpdateStock = `
        UPDATE Produk
        SET stock = stock ${jenis_transaksi === 'masuk' ? '-' : '+'} 1
        WHERE id_produk = ?
      `;

      connection.query(queryUpdateStock, [id_produk], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        connection.query(queryDelete, [id], (err, results) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }

            res.status(200).json({ message: 'Transaction deleted and stock updated successfully!', results });
          });
        });
      });
    });
  });
});

module.exports = app;

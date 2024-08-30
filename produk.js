const express = require('express');
const connection = require('./db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// CREATE (Insert produk berdasarkan kategori secara massal)
app.post('/produk', (req, res) => {
  const { id_kategori_produk, products } = req.body;
  
  const values = products.map(product => [
    product.nama_produk,
    product.stock,
    product.harga_produk,
    product.photo_produk,
    id_kategori_produk
  ]);

  const query = `
    INSERT INTO Produk (nama_produk, stock, harga_produk, photo_produk, id_kategori_produk)
    VALUES ?
  `;

  connection.query(query, [values], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ message: 'Products added successfully!', results });
    }
  });
});

// READ (Get all products)
app.get('/produk', (req, res) => {
  connection.query('SELECT * FROM Produk', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// UPDATE (Update produk by id)
app.put('/produk/:id', (req, res) => {
  const { id } = req.params;
  const { nama_produk, stock, harga_produk, photo_produk, id_kategori_produk } = req.body;

  const query = `
    UPDATE Produk 
    SET nama_produk = ?, stock = ?, harga_produk = ?, photo_produk = ?, id_kategori_produk = ?
    WHERE id_produk = ?
  `;

  connection.query(query, [nama_produk, stock, harga_produk, photo_produk, id_kategori_produk, id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Product updated successfully!', results });
    }
  });
});

// DELETE (Delete produk by id)
app.delete('/produk/:id', (req, res) => {
  const { id } = req.params;

  connection.query('DELETE FROM Produk WHERE id_produk = ?', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Product deleted successfully!', results });
    }
  });
});

module.exports = app;

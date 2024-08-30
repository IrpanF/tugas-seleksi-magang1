const express = require('express');
const produkRoutes = require('./produk');
const transaksiRoutes = require('./transaksi');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api', produkRoutes);
app.use('/api', transaksiRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

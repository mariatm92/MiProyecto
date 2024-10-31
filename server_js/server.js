const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get('/usuarios', (req, res) => {
  const filePath = path.join(__dirname, 'usuarios.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error al leer el archivo');
    } else {
      res.send(data);
    }
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
// server/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Configura el directorio raíz del proyecto
const projectRoot = path.join(__dirname, '..');

// Sirve archivos estáticos desde el directorio del proyecto
app.use(express.static(projectRoot));



app.get('/habitaciones', (req, res) => {
  const filePath = path.join(__dirname, 'habitaciones.json');
  console.log('Intentando leer el archivo:', filePath); // Mensaje de depuración
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error leyendo el archivo:', err);
          res.status(500).send('Error reading the file');
      } else {
          res.json(JSON.parse(data));
      }
  });
});


app.get('/servicios', (req, res) => {
  const filePath = path.join(__dirname, 'servicios.json');
  console.log('Intentando leer el archivo:', filePath); // Mensaje de depuración
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error leyendo el archivo:', err);
          res.status(500).send('Error reading the file');
      } else {
          res.json(JSON.parse(data));
      }
  });
});



// Endpoints principales

app.get('/stock', (req, res) => {
  const filePath = path.join(__dirname, 'stock.json');
  console.log('Intentando leer el archivo:', filePath); // Mensaje de depuración
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error leyendo el archivo:', err);
          res.status(500).send('Error reading the file');
      } else {
          res.json(JSON.parse(data));
      }
  });
});

app.get('/reservas', (req, res) => {
    const filePath = path.join(__dirname, 'reservas.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/usuarios', (req, res) => {
    const filePath = path.join(__dirname, 'usuarios.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file');
        } else {
            res.send(data);
        }
    });
});

app.get('/empleados', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// Endpoint para eliminar empleados
app.delete('/empleados/:id', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json');
    const employeeId = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file');
        }

        let employees = JSON.parse(data).empleados;
        const filteredEmployees = employees.filter(employee => employee.id !== employeeId);

        fs.writeFile(filePath, JSON.stringify({ empleados: filteredEmployees }, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file');
            }
            res.status(200).send('Employee deleted successfully');
        });
    });
});

// Endpoints para agregar y modificar empleados
app.post('/empleados', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json');
    const nuevoEmpleado = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file');
        }

        let empleados = JSON.parse(data).empleados;
        empleados.push(nuevoEmpleado);

        fs.writeFile(filePath, JSON.stringify({ empleados: empleados }, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file');
            }
            res.status(200).json(nuevoEmpleado);
        });
    });
});

app.post('/empleados/modify', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json');
    const empleadoActualizado = req.body;
    const employeeId = empleadoActualizado.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file');
        }

        let empleadosData = JSON.parse(data);
        let empleados = empleadosData.empleados;
        const employeeIndex = empleados.findIndex(emp => emp.id.toString() === employeeId.toString());

        if (employeeIndex === -1) {
            return res.status(404).send('Empleado no encontrado');
        }

        empleados[employeeIndex] = { ...empleados[employeeIndex], ...empleadoActualizado };

        fs.writeFile(filePath, JSON.stringify(empleadosData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file');
            }
            res.status(200).json(empleados[employeeIndex]);
        });
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Accede a la página en: http://localhost:${PORT}`);
});

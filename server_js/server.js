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


function eliminarHabitacion(idHabitacion) {
    if (confirm('¿Está seguro de que desea eliminar esta habitación?')) {
        fetch(`http://localhost:3000/habitaciones/${idHabitacion}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al eliminar la habitación');
            }
            // Limpiar y recargar la visualización de habitaciones
            const habitacioneshotel = document.getElementById('habitacioneshotel');
            habitacioneshotel.innerHTML = '';
            mostrarStock();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar la habitación');
        });
    }
}


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

// eliminar habitaciones 

app.delete('/habitaciones/:id', (req, res) => {
    const filePath = path.join(__dirname, 'habitaciones.json');
    const roomId = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).send('Error al leer el archivo');
        }

        let roomsData = JSON.parse(data);
        roomsData.habitaciones = roomsData.habitaciones.filter(room => room.id !== roomId);

        fs.writeFile(filePath, JSON.stringify(roomsData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(200).send('Habitación eliminada correctamente');
        });
    });
});

app.get('/regimen', (req, res) => {
  const filePath = path.join(__dirname, 'regimen.json');
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
// eliminar regimen 
app.delete('/regimen/:id', (req, res) => {
    const filePath = path.join(__dirname, 'regimen.json');
    const regimenId = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).send('Error al leer el archivo');
        }

        let regimenData = JSON.parse(data);
        regimenData = regimenData.filter(regimen => regimen.id !== regimenId);

        fs.writeFile(filePath, JSON.stringify(regimenData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(200).send('Régimen eliminado correctamente');
        });
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

//eliminar servicios 
app.delete('/servicios/:id', (req, res) => {
    const filePath = path.join(__dirname, 'servicios.json');
    const servicioId = parseInt(req.params.id);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        let serviciosData = JSON.parse(data);
        serviciosData = serviciosData.filter(servicio => servicio.id !== servicioId);

        fs.writeFile(filePath, JSON.stringify(serviciosData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(200).send('Servicio eliminado correctamente');
        });
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

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

app.delete('/habitaciones/:id', (req, res) => {
    const habitacionesPath = path.join(__dirname, 'habitaciones.json');
    const stockPath = path.join(__dirname, 'stock.json');
    const habitacionId = parseInt(req.params.id);

    fs.readFile(habitacionesPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de habitaciones:', err);
            return res.status(500).send('Error al leer el archivo de habitaciones');
        }

        let roomsData;
        try {
            roomsData = JSON.parse(data);
            if (!Array.isArray(roomsData.habitaciones)) {
                throw new Error('El contenido de habitaciones.json no es un array');
            }
        } catch (error) {
            console.error('Error al parsear el archivo de habitaciones:', error);
            return res.status(500).send('Error al parsear el archivo de habitaciones');
        }

        roomsData.habitaciones = roomsData.habitaciones.filter(room => room.id !== habitacionId);

        fs.writeFile(habitacionesPath, JSON.stringify(roomsData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo de habitaciones:', err);
                return res.status(500).send('Error al escribir el archivo de habitaciones');
            }

            // Eliminar del stock
            fs.readFile(stockPath, 'utf8', (err, stockData) => {
                if (err) {
                    console.error('Error al leer el archivo de stock:', err);
                    return res.status(500).send('Error al leer el archivo de stock');
                }

                let stock;
                try {
                    stock = JSON.parse(stockData);
                    if (!Array.isArray(stock.stock.habitaciones)) {
                        throw new Error('El contenido de stock no es un array');
                    }
                } catch (error) {
                    console.error('Error al parsear el archivo de stock:', error);
                    return res.status(500).send('Error al parsear el archivo de stock');
                }

                stock.stock.habitaciones = stock.stock.habitaciones.filter(room => room.id !== habitacionId);

                fs.writeFile(stockPath, JSON.stringify(stock, null, 2), (err) => {
                    if (err) {
                        console.error('Error al escribir el archivo de stock:', err);
                        return res.status(500).send('Error al escribir el archivo de stock');
                    }
                    res.status(200).send('Habitación eliminada correctamente');
                });
            });
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
app.delete('/servicios/:id', (req, res) => {
    const serviciosPath = path.join(__dirname, 'servicios.json');
    const stockPath = path.join(__dirname, 'stock.json');
    const servicioId = parseInt(req.params.id);

    console.log(`Intentando eliminar servicio con ID: ${servicioId}`);

    // Eliminar del archivo de servicios
    fs.readFile(serviciosPath, 'utf8', (err, serviciosData) => {
        if (err) {
            console.error('Error al leer servicios:', err);
            return res.status(500).send('Error al leer servicios');
        }

        let servicios = JSON.parse(serviciosData);
        const servicioOriginal = servicios.find(servicio => servicio.id === servicioId);
        servicios = servicios.filter(servicio => servicio.id !== servicioId);

        console.log('Servicio original:', servicioOriginal);

        fs.writeFile(serviciosPath, JSON.stringify(servicios, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir servicios:', err);
                return res.status(500).send('Error al escribir servicios');
            }

            // Eliminar del stock
            fs.readFile(stockPath, 'utf8', (err, stockData) => {
                if (err) {
                    console.error('Error al leer stock:', err);
                    return res.status(500).send('Error al leer stock');
                }

                let stock = JSON.parse(stockData);
                const stockAnterior = stock.stock.servicios.length;
                stock.stock.servicios = stock.stock.servicios.filter(servicio => servicio.id !== servicioId);
                
                console.log(`Stock anterior: ${stockAnterior}, Stock después: ${stock.stock.servicios.length}`);

                fs.writeFile(stockPath, JSON.stringify(stock, null, 2), (err) => {
                    if (err) {
                        console.error('Error al escribir stock:', err);
                        return res.status(500).send('Error al escribir stock');
                    }
                    res.status(200).send('Servicio eliminado correctamente');
                });
            });
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
    const serviciosPath = path.join(__dirname, 'servicios.json');
    const stockPath = path.join(__dirname, 'stock.json');
    const servicioId = parseInt(req.params.id);

    // Eliminar del archivo de servicios
    fs.readFile(serviciosPath, 'utf8', (err, serviciosData) => {
        if (err) {
            return res.status(500).send('Error al leer servicios');
        }

        let servicios = JSON.parse(serviciosData);
        servicios = servicios.filter(servicio => servicio.id !== servicioId);

        fs.writeFile(serviciosPath, JSON.stringify(servicios, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir servicios');
            }

            // Eliminar del stock
            fs.readFile(stockPath, 'utf8', (err, stockData) => {
                if (err) {
                    return res.status(500).send('Error al leer stock');
                }

                let stock = JSON.parse(stockData);
                stock.stock.servicios = stock.stock.servicios.filter(servicio => servicio.id !== servicioId);

                fs.writeFile(stockPath, JSON.stringify(stock, null, 2), (err) => {
                    if (err) {
                        return res.status(500).send('Error al escribir stock');
                    }
                    res.status(200).send('Servicio eliminado correctamente');
                });
            });
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

//NUEVOS ENDPOINTS PARA AGREGAR
app.post('/habitaciones', (req, res) => {
    const filePath = path.join(__dirname, 'habitaciones.json');
    const nuevaHabitacion = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        let habitacionesData = JSON.parse(data);
        // Generar nuevo ID
        const maxId = Math.max(...habitacionesData.habitaciones.map(h => h.id), 0);
        nuevaHabitacion.id = maxId + 1;

        habitacionesData.habitaciones.push(nuevaHabitacion);

        fs.writeFile(filePath, JSON.stringify(habitacionesData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(201).json(nuevaHabitacion);
        });
    });
});

app.post('/servicios', (req, res) => {
    const filePath = path.join(__dirname, 'servicios.json');
    const nuevoServicio = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        let servicios = JSON.parse(data);
        const maxId = Math.max(...servicios.map(s => s.id), 0);
        nuevoServicio.id = maxId + 1;

        servicios.push(nuevoServicio);

        fs.writeFile(filePath, JSON.stringify(servicios, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(201).json(nuevoServicio);
        });
    });
});

app.post('/regimen', (req, res) => {
    const filePath = path.join(__dirname, 'regimen.json');
    const nuevoRegimen = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        let regimenes = JSON.parse(data);
        const maxId = Math.max(...regimenes.map(r => r.id), 0);
        nuevoRegimen.id = maxId + 1;

        regimenes.push(nuevoRegimen);

        fs.writeFile(filePath, JSON.stringify(regimenes, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo');
            }
            res.status(201).json(nuevoRegimen);
        });
    });
});
app.post('/stock/:tipo', (req, res) => {
    const filePath = path.join(__dirname, 'stock.json');
    const tipo = req.params.tipo;
    const nuevoProducto = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        let stockData = JSON.parse(data);
        
        if (tipo === 'habitaciones' || tipo === 'servicios') {
            // Agregar el nuevo producto al stock
            stockData.stock[tipo].push({
                id: nuevoProducto.id,
                producto: nuevoProducto.producto,
                precio: nuevoProducto.precio,
                cantidad: nuevoProducto.cantidad
            });

            fs.writeFile(filePath, JSON.stringify(stockData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error al escribir el archivo');
                }
                res.status(201).json(nuevoProducto);
            });
        } else {
            res.status(400).send('Tipo de producto no válido');
        }
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Accede a la página en: http://localhost:${PORT}`);
});

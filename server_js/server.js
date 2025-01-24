// Importación de módulos necesarios
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Carga las variables de entorno desde un archivo .env

const app = express(); // Inicializa la aplicación Express

// Middleware para habilitar CORS y parsear solicitudes en JSON
app.use(cors());
app.use(express.json());

// Configura el directorio raíz del proyecto
const projectRoot = path.join(__dirname, '..');

// Sirve archivos estáticos desde el directorio raíz
app.use(express.static(projectRoot));


// Endpoint para obtener reservas desde reservas.json
app.get('/reservas', (req, res) => {
    const filePath = path.join(__dirname, 'reservas.json'); // Ruta del archivo
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file'); // Error al leer
        } else {
            res.json(JSON.parse(data)); // Devuelve las reservas
        }
    });
});

// Endpoint para obtener usuarios desde usuarios.json
app.get('/usuarios', (req, res) => {
    const filePath = path.join(__dirname, 'usuarios.json'); // Ruta del archivo
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file'); // Error al leer
        } else {
            res.send(data); // Devuelve los datos en texto plano
        }
    });
});

// Endpoint para obtener empleados desde empleados.json
app.get('/empleados', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json'); // Ruta del archivo
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading the file'); // Error al leer
        } else {
            res.json(JSON.parse(data)); // Devuelve los empleados
        }
    });
});

// Endpoint para eliminar empleados
app.delete('/empleados/:id', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json'); // Ruta del archivo
    const employeeId = req.params.id; // ID del empleado a eliminar

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file'); // Error al leer
        }

        let employees = JSON.parse(data).empleados; // Lista de empleados
        const filteredEmployees = employees.filter(employee => employee.id !== employeeId); // Filtra empleados

        fs.writeFile(filePath, JSON.stringify({ empleados: filteredEmployees }, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file'); // Error al escribir
            }
            res.status(200).send('Employee deleted successfully'); // Confirmación de eliminación
        });
    });
});

// Endpoint para agregar empleados
app.post('/empleados', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json'); // Ruta del archivo
    const nuevoEmpleado = req.body; // Datos del nuevo empleado

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file'); // Error al leer
        }

        let empleados = JSON.parse(data).empleados; // Lista de empleados
        empleados.push(nuevoEmpleado); // Agrega el nuevo empleado

        fs.writeFile(filePath, JSON.stringify({ empleados: empleados }, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file'); // Error al escribir
            }
            res.status(200).json(nuevoEmpleado); // Devuelve el nuevo empleado
        });
    });
});

// Endpoint para modificar empleados
app.post('/empleados/modify', (req, res) => {
    const filePath = path.join(__dirname, 'empleados.json'); // Ruta del archivo
    const empleadoActualizado = req.body; // Datos del empleado actualizado
    const employeeId = empleadoActualizado.id; // ID del empleado

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading the file'); // Error al leer
        }

        let empleadosData = JSON.parse(data);
        let empleados = empleadosData.empleados;
        const employeeIndex = empleados.findIndex(emp => emp.id.toString() === employeeId.toString()); // Busca el índice

        if (employeeIndex === -1) {
            return res.status(404).send('Empleado no encontrado'); // Error si no se encuentra
        }

        empleados[employeeIndex] = { ...empleados[employeeIndex], ...empleadoActualizado }; // Actualiza datos

        fs.writeFile(filePath, JSON.stringify(empleadosData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the file'); // Error al escribir
            }
            res.status(200).json(empleados[employeeIndex]); // Devuelve el empleado actualizado
        });
    });
});

// Endpoint para obtener el stock desde stock.json
app.get('/stock', (req, res) => {
    const stockPath = path.join(__dirname, 'stock.json');
    const habitacionesPath = path.join(__dirname, 'habitaciones.json');

    console.log('Stock path:', stockPath);
    console.log('Habitaciones path:', habitacionesPath);

    fs.readFile(stockPath, 'utf8', (err, stockData) => {
        if (err) {
            console.error('Error reading stock file:', err);
            return res.status(500).send('Error al leer el archivo de stock');
        }

        fs.readFile(habitacionesPath, 'utf8', (err, habitacionesData) => {
            if (err) {
                console.error('Error reading habitaciones file:', err);
                return res.status(500).send('Error al leer el archivo de habitaciones');
            }

            try {
                const stock = JSON.parse(stockData);
                const habitaciones = JSON.parse(habitacionesData).habitaciones;

                console.log('Stock data:', stock);
                console.log('Habitaciones data:', habitaciones);

                const stockHabitaciones = stock.stock.habitaciones.map(item => {
                    const habitacion = habitaciones.find(h => Number(h.id) === Number(item.id));
                    return {
                        id: item.id,
                        cantidad: item.cantidad,
                        nombre: habitacion ? habitacion.producto : 'Desconocido',
                        precio: habitacion ? habitacion.precio : 0
                    };
                });

                stock.stock.habitaciones = stockHabitaciones;

                console.log('Stock final:', stock);
                res.json(stock);
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                res.status(500).send('Error parsing JSON data');
            }
        });
    });
});

app.get('/habitaciones', (req, res) => {
    const habitacionesPath = path.join(__dirname, 'habitaciones.json');
    fs.readFile(habitacionesPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading habitaciones file:', err);
            return res.status(500).send('Error al leer el archivo de habitaciones');
        }
        res.json(JSON.parse(data));
    });
});
app.get('/servicios', (req, res) => {
    const serviciosPath = path.join(__dirname, 'servicios.json');
    fs.readFile(serviciosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading servicios file:', err);
            return res.status(500).send('Error al leer el archivo de servicios');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to delete a product from stock
app.delete('/stock/:tipo/delete/:id', (req, res) => {
    const filePath = path.join(__dirname, 'stock.json');
    const tipo = req.params.tipo;
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de stock');
        }

        let stockData = JSON.parse(data);
        const indexInStock = stockData.stock[tipo].findIndex(item => item.id.toString() === id);

        if (indexInStock === -1) {
            return res.status(404).send('Producto no encontrado en stock');
        }

        // Remove the item from stock
        stockData.stock[tipo].splice(indexInStock, 1);

        fs.writeFile(filePath, JSON.stringify(stockData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de stock');
            }
            res.status(200).send('Producto eliminado del stock');
        });
    });
});
////// ESTE BOTON NO FUNCIONA ///////////////////////////////////////////////////////////////////////
// Endpoint to delete a product from habitaciones.json
app.delete('/habitaciones/delete/:id', (req, res) => {
    const filePath = path.join(__dirname, 'habitaciones.json');
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de habitaciones');
        }

        let habitacionesData = JSON.parse(data);
        const indexInHabitaciones = habitacionesData.habitaciones.findIndex(item => item.id === Number(id));

        if (indexInHabitaciones === -1) {
            console.log(`Intentó eliminar habitación con ID: ${id}, pero no se encontró`);
            return res.status(404).send('Habitación no encontrada');
        }

        // Remove the item from habitaciones
        habitacionesData.habitaciones.splice(indexInHabitaciones, 1);

        fs.writeFile(filePath, JSON.stringify(habitacionesData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de habitaciones');
            }
            res.status(200).send('Habitación eliminada');
        });
    });
    
});


////// ESTE BOTON NO FUNCIONA ///////////////////////////////////////////////////////////////////////

// Endpoint to delete a product from servicios.json
app.delete('/servicios/delete/:id', (req, res) => {
    const filePath = path.join(__dirname, 'servicios.json');
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de servicios');
        }

        let serviciosData = JSON.parse(data);
        const indexInServicios = serviciosData.findIndex(item => item.id.toString() === id);

        if (indexInServicios === -1) {
            return res.status(404).send('Servicio no encontrado');
        }

        // Remove the item from servicios
        serviciosData.splice(indexInServicios, 1);

        fs.writeFile(filePath, JSON.stringify(serviciosData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de servicios');
            }
            res.status(200).send('Servicio eliminado');
        });
    });
});

// Endpoint para agregar un producto al stock
app.post('/stock/:tipo', (req, res) => {
    const filePath = path.join(__dirname, 'stock.json'); // Ruta del archivo
    const tipo = req.params.tipo; // Tipo de producto (habitaciones o servicios)
    const nuevoProducto = req.body; // Datos del nuevo producto

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo'); // Error al leer
        }

        let stockData = JSON.parse(data);

        if (tipo === 'habitaciones' || tipo === 'servicios') {
            // Agrega el nuevo producto al stock
            stockData.stock[tipo].push({
                id: nuevoProducto.id,
                producto: nuevoProducto.producto,
                precio: nuevoProducto.precio,
                cantidad: nuevoProducto.cantidad
            });

            fs.writeFile(filePath, JSON.stringify(stockData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error al escribir el archivo'); // Error al escribir
                }
                res.status(201).json(nuevoProducto); // Confirma el agregado
            });
        } else {
            res.status(400).send('Tipo de producto no válido'); // Error si el tipo no es válido
        }
    });
});

//ENDPOINTS PARA AGREGAR
// Endpoint to add a product to habitaciones.json
app.post('/habitaciones', (req, res) => {
    const filePath = path.join(__dirname, 'habitaciones.json');
    const nuevoProducto = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de habitaciones');
        }

        let habitacionesData = JSON.parse(data);
        habitacionesData.habitaciones.push(nuevoProducto);

        fs.writeFile(filePath, JSON.stringify(habitacionesData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de habitaciones');
            }
            res.status(201).json(nuevoProducto);
        });
    });
});

// Endpoint to add a product to servicios.json
app.post('/servicios', (req, res) => {
    const filePath = path.join(__dirname, 'servicios.json');
    const nuevoProducto = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de servicios');
        }

        let serviciosData = JSON.parse(data);
        serviciosData.push(nuevoProducto);

        fs.writeFile(filePath, JSON.stringify(serviciosData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de servicios');
            }
            res.status(201).json(nuevoProducto);
        });
    });
});

//FIN ENDPOINTS PARA AGREGAR


// Configuración del puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`); // Mensaje de confirmación
    console.log(`Accede a la página en: http://localhost:${PORT}`); // URL para acceso
});

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

// Endpoint to delete a product from habitaciones.json
app.delete('/habitaciones/delete/:id', (req, res) => {
    const filePath = path.join(__dirname, 'habitaciones.json');
    const id = req.params.id;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de habitaciones');
        }

        let habitacionesData = JSON.parse(data);
        const indexInHabitaciones = habitacionesData.habitaciones.findIndex(item => item.id.toString() === id);

        if (indexInHabitaciones === -1) {
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

//ENDPOINT PARA EL CARRITO DE COMPRA
// Endpoint to update stock quantity
app.patch('/stock/:tipo/update/:id', (req, res) => {
    const filePath = path.join(__dirname, 'stock.json');
    const tipo = req.params.tipo;
    const id = req.params.id;
    const { cantidad } = req.body;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo de stock');
        }

        let stockData = JSON.parse(data);
        const stockItemIndex = stockData.stock[tipo].findIndex(item => item.id.toString() === id);

        if (stockItemIndex === -1) {
            return res.status(404).send('Producto no encontrado en stock');
        }

        // Update the stock quantity
        stockData.stock[tipo][stockItemIndex].cantidad += cantidad;

        // Ensure quantity doesn't go negative
        if (stockData.stock[tipo][stockItemIndex].cantidad < 0) {
            stockData.stock[tipo][stockItemIndex].cantidad = 0;
        }

        fs.writeFile(filePath, JSON.stringify(stockData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error al escribir el archivo de stock');
            }
            res.status(200).json({
                id: id,
                nuevaCantidad: stockData.stock[tipo][stockItemIndex].cantidad
            });
        });
    });
});
//FIN ENDPOINT CARRITO DE COMPRA 

//--------- ENDPOINTS MODIFICAR STOCK Y HABITACIONES --------------
app.patch('/habitaciones/modify', (req, res) => {
    const filePathHabitaciones = path.join(__dirname, 'habitaciones.json');
    const filePathServicios = path.join(__dirname, 'servicios.json');
    const filePathStock = path.join(__dirname, 'stock.json');
    const productoActualizado = req.body;
    const productoId = productoActualizado.id;
    const productoTipo = productoActualizado.tipo;

    console.log('Received update request for:', productoId);

    let filePathProducto;
    let productoKey;

    if (productoTipo === 'habitaciones') {
        filePathProducto = filePathHabitaciones;
        productoKey = 'habitaciones';
    } else if (productoTipo === 'servicios') {
        filePathProducto = filePathServicios;
        productoKey = 'servicios';
    } else {
        return res.status(400).send('Tipo de producto no válido');
    }

    // Read and update the habitaciones/servicios file
    fs.readFile(filePathProducto, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send(`Error reading the ${productoKey} file`);
        }

        let productoData = JSON.parse(data);
        let productos = productoData[productoKey];
        const productoIndex = productos.findIndex(prd => prd.id.toString() === productoId.toString());

        if (productoIndex === -1) {
            console.error(`${productoTipo} no encontrado:`, productoId);
            return res.status(404).send(`${productoTipo} no encontrado`);
        }

        productos[productoIndex] = { ...productos[productoIndex], ...productoActualizado };
        console.log(`Updated ${productoTipo}:`, productos[productoIndex]);

        fs.writeFile(filePathProducto, JSON.stringify(productoData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send(`Error writing the ${productoKey} file`);
            }

            // Read and update the stock.json file
            fs.readFile(filePathStock, 'utf8', (err, stockData) => {
                if (err) {
                    console.error('Error reading stock file:', err);
                    return res.status(500).send('Error reading the stock file');
                }

                let stockJsonData = JSON.parse(stockData);
                let productoStock = stockJsonData.stock[productoKey];
                const stockIndex = productoStock.findIndex(item => item.id.toString() === productoId.toString());

                if (stockIndex === -1) {
                    console.error('Stock item no encontrado:', productoId);
                    return res.status(404).send('Stock item no encontrado');
                }

                productoStock[stockIndex].cantidad = parseInt(productoActualizado.cantidad, 10);
                console.log('Updated stock:', productoStock[stockIndex]);

                fs.writeFile(filePathStock, JSON.stringify(stockJsonData, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing stock file:', err);
                        return res.status(500).send('Error writing the stock file');
                    }
                    res.status(200).json(productos[productoIndex]);
                    console.log(`${productoTipo} successfully updated:`, productos[productoIndex]);
                });
            });
        });
    });
});

// Endpoint to modify servicios
app.patch('/servicios/modify', (req, res) => {
    const filePathServicios = path.join(__dirname, 'servicios.json');
    const filePathStock = path.join(__dirname, 'stock.json');
    const servicioActualizado = req.body;
    const servicioId = servicioActualizado.id;

    console.log('Received update request for:', servicioId);

    // Read and update the servicios.json file
    fs.readFile(filePathServicios, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading servicios file:', err);
            return res.status(500).send('Error reading the servicios file');
        }

        let servicios;
        try {
            servicios = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing servicios file:', parseError);
            return res.status(500).send('Error parsing the servicios file');
        }

        if (!Array.isArray(servicios)) {
            console.error('Servicios data is not an array');
            return res.status(500).send('Invalid servicios data structure');
        }

        const servicioIndex = servicios.findIndex(srv => srv.id.toString() === servicioId.toString());

        if (servicioIndex === -1) {
            console.error('Servicio no encontrado:', servicioId);
            return res.status(404).send('servicio no encontrado');
        }

        servicios[servicioIndex] = { ...servicios[servicioIndex], ...servicioActualizado };
        console.log('Updated servicio:', servicios[servicioIndex]);

        fs.writeFile(filePathServicios, JSON.stringify(servicios, null, 2), (err) => {
            if (err) {
                console.error('Error writing servicios file:', err);
                return res.status(500).send('Error writing the servicios file');
            }

            // Read and update the stock.json file
            fs.readFile(filePathStock, 'utf8', (err, stockData) => {
                if (err) {
                    console.error('Error reading stock file:', err);
                    return res.status(500).send('Error reading the stock file');
                }

                let stockJsonData;
                try {
                    stockJsonData = JSON.parse(stockData);
                } catch (parseError) {
                    console.error('Error parsing stock file:', parseError);
                    return res.status(500).send('Error parsing the stock file');
                }

                if (!Array.isArray(stockJsonData.stock.servicios)) {
                    console.error('Servicios key is missing or not an array in stock file');
                    return res.status(500).send('Invalid stock data structure');
                }

                let serviciosStock = stockJsonData.stock.servicios;
                const stockIndex = serviciosStock.findIndex(item => item.id.toString() === servicioId.toString());

                if (stockIndex === -1) {
                    console.error('Stock item no encontrado:', servicioId);
                    return res.status(404).send('Stock item no encontrado');
                }

                serviciosStock[stockIndex].cantidad = parseInt(servicioActualizado.cantidad, 10);
                console.log('Updated stock:', serviciosStock[stockIndex]);

                fs.writeFile(filePathStock, JSON.stringify(stockJsonData, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing stock file:', err);
                        return res.status(500).send('Error writing the stock file');
                    }
                    res.status(200).json(servicios[servicioIndex]);
                    console.log('Servicio successfully updated:', servicios[servicioIndex]);
                });
            });
        });
    });
});

 // -------- FIN ENDPOINTS MODIFICAR STOCK Y HABITACIONES

 //ENDPOINT PARA GUARDAR RESERVAS
// Endpoint para guardar una nueva reserva
app.post('/reservas', (req, res) => {
    const filePath = path.join(__dirname, 'reservas.json');
    const nuevaReserva = req.body;

    if (!nuevaReserva.id || !nuevaReserva.fecha || !nuevaReserva.cliente || !nuevaReserva.precioTotal) {
        return res.status(400).send('Datos incompletos para la reserva');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).send('Error al leer el archivo de reservas');
        }

        let reservasData = JSON.parse(data);
        
        // Asegurarse de que reservas es un array
        if (!Array.isArray(reservasData.reservas)) {
            reservasData.reservas = [];
        }

        // Añadir la nueva reserva
        reservasData.reservas.push(nuevaReserva);

        fs.writeFile(filePath, JSON.stringify(reservasData, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
                return res.status(500).send('Error al escribir el archivo de reservas');
            }
            res.status(201).json(nuevaReserva);
        });
    });
});
 //FIN ENDPPOINT PARA GUARDAR RESERVAS

// Configuración del puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`); // Mensaje de confirmación
    console.log(`Accede a la página en: http://localhost:${PORT}`); // URL para acceso
});

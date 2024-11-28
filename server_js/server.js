const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(projectDir, 'admin.html'));
});

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

      res.status(200).json(nuevoEmpleado); // Retorna el nuevo empleado agregado
    });
  });
});

app.post('/empleados/modify', (req, res) => {
  const filePath = path.join(__dirname, 'empleados.json');
  const empleadoActualizado = req.body;

  // Extrae el ID del empleado desde el cuerpo de la solicitud
  const employeeId = empleadoActualizado.id;

  console.log('ID recibido:', employeeId); // Esto debe mostrar el ID del empleado a modificar
  console.log('Datos actualizados:', empleadoActualizado);

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('Error reading the file');
      }

      let empleadosData = JSON.parse(data);
      let empleados = empleadosData.empleados;

      console.log('Empleados actuales:', empleados);

      // Encontrar el índice del empleado a actualizar usando el ID
      const employeeIndex = empleados.findIndex(emp => emp.id.toString() === employeeId.toString());

      console.log('Índice encontrado:', employeeIndex);

      if (employeeIndex === -1) {
          return res.status(404).send('Empleado no encontrado');
      }

      console.log(employeeId);
      // Actualizar el empleado manteniendo su ID original
      empleados = empleados.map(empleado =>
        empleado.id === employeeId
          ? { ...empleado, ...empleadoActualizado }
          : empleado
      );
    

      // Escribir los datos actualizados en el archivo
      fs.writeFile(filePath, JSON.stringify(empleadosData, null, 2), (err) => {
          if (err) {
              console.error('Error writing file:', err);
              return res.status(500).send('Error writing the file');
          }

          // Enviar la respuesta con el empleado actualizado
          res.status(200).json(empleados[employeeIndex]);
      });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy:{
      directives:{
        defaultSrc:["'self'"],
        styleSrc:["'self'", "'unsafe-inline'"]
      },
    },
  })
);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'austin5320', 
  database: 'seatarrangement', 
});

connection.connect(error => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
  } else {
    console.log('成功連線至mySQL');
  }
});

const employeeTable = 'employee';
const seatingChartTable = 'seatingchart';

// Read all employees
app.get('/api/employees', (req, res) => {
  const sql = 'SELECT * FROM employee';
  connection.query(sql, (error, results) => {
    if (error) {
      console.log('連線失敗');
      res.status(500).json({ message: error.message });
    } else {
      res.json(results);
    }
  });
});

// Create employee
app.post('/api/employees', (req, res) => {
  const { EMP_ID, NAME, EMAIL, FLOOR_SEAT_SEQ } = req.body;
  const sql = 'INSERT INTO employee (EMP_ID, NAME, EMAIL, FLOOR_SEAT_SEQ) VALUES (?, ?, ?, ?)';
  connection.query(sql, [EMP_ID, NAME, EMAIL, FLOOR_SEAT_SEQ], (error, results) => {
    if (error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(201).json({ id: results.insertId, EMP_ID, NAME, EMAIL, FLOOR_SEAT_SEQ });
    }
  });
});

// Read all seats
app.get('/api/seats', (req, res) => {
  const sql = 'SELECT * FROM seatingchart';
  connection.query(sql, (error, results) => {
    if (error) {
      console.log('連線失敗')
      res.status(500).json({ message: error.message });
    } else {
      res.json(results);
    }
  });
});


// Update seat by ID
app.put('/api/seats/:id', (req, res) => {
  const { id } = req.params;
  const { FLOOR_NO, SEAT_NO } = req.body;
  const sql = 'UPDATE seatingchart SET FLOOR_NO = ?, SEAT_NO = ? WHERE FLOOR_SEAT_SEQ = ?';
  connection.query(sql, [FLOOR_NO, SEAT_NO, id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      if (results.affectedRows > 0) {
        res.json({ FLOOR_SEAT_SEQ: id });
        res.json({message: '座位資訊已更新'})
      } else {
        res.status(404).json({ message: 'Seat not found' });
      }
    }
  });
});

// Delete seat by ID
app.delete('/api/seats/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM seatingchart WHERE FLOOR_SEAT_SEQ = ?';
  connection.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      if (results.affectedRows > 0) {
        res.json({ FLOOR_SEAT_SEQ: id });
      } else {
        res.status(404).json({ message: 'Seat not found' });
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const Pool = require('pg').Pool;
const fs = require('fs');
const csvParser = require("csv-parser");
var format = require('pg-format');

require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});


const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { your_name, your_email } = request.body;

  pool.query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [your_name, your_email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};

const uploadExcel = (request, response) => {
  try {
    if (!request.file) {
      return response.status(400).send('Please upload a CSV file');
    }

    const filePath = request.file.path;
    var result = [];

    // Parse the CSV file
    var csvStream = fs.createReadStream(filePath, { encoding: "utf-8" });

    csvStream.pipe(csvParser())
      .on("data", (row) => {
        var your_name = row["your_name"];
        var your_email = row["your_email"];
        result.push([your_name, your_email]);
      })
      .on("end", () => {
        fs.unlinkSync(request.file.path);
        var check = 0;
        try {
          console.log(result)
          pool.query(format(
            'INSERT INTO users (name, email) VALUES %L RETURNING *', result),
            (error, results) => {
              if (error) {
                throw error;
              }
              return response.status(201).send(`User added with ID: ${results}}`);
            }
          );
        } catch (error) {
          return response.status(500).send('Error insert csv file');
        }
      });
  } catch (error) {
    console.error(error);
    response.status(500).send('Error processing CSV file');
  }
  // fs.unlinkSync(request.file.path);
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadExcel,
};

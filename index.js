const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const db = require('./queries');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/users', db.getUsers);
app.get('/users/:id', db.getUserById);
app.post('/users', db.createUser);
app.put('/users/:id', db.updateUser);
app.delete('/users/:id', db.deleteUser);

const multer = require('multer');
// SET STORAGE
const upload = multer({ dest: 'http://gotech2.infinityfreeapp.com/gotech2/wp-content/uploads/wp_dndcf7_uploads/wpcf7-files/' });
// Configure Multer for file upload handling
app.post('/uploadExcel', upload.single('uploads'), db.uploadExcel);


app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

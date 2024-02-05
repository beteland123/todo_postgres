const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');
const ejs = require('ejs');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todlist',
  password: '88',
  port: 5432
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
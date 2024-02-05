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

app.get('/', async (req, res) => {
  try {
    const results = await db.query('SELECT * FROM todo');
    res.render('index', { todos: results.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving todos');
  }
});

app.post('/todos', async (req, res) => {
  const { content } = req.body;
  try {
    await db.query('INSERT INTO todo (content, completed) VALUES ($1, $2)', [content, false]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating todo');
  }
});

app.delete('/todos/:id/delete', async (req, res) => {
  const todoId = req.params.id;
  try {
    await db.query('DELETE FROM todo WHERE id = $1', [todoId]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting todo');
  }
});

app.post('/todos/:id/complete', async (req, res) => {
  const todoId = req.params.id;
  const completed = req.body.completed;
  try {
    await db.query('UPDATE todo SET completed = $1 WHERE id = $2', [completed, todoId]);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating todo');
  }
});

app.post('/todos/clear-completed', async(re,res)=>{
  try{
    await db.query('DELETE FROM todo WHERE completed = true');
    res.redirect('/')
  } catch (error){
    console.error(error)
    res.status(500).send('Error to delete all')
  }
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
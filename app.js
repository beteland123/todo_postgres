const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const pg = require('pg');
const ejs = require('ejs');
const app = express();
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');//to generate the secret key

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

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));
// Login Page
app.get('/', (req, res) => {
  res.render('login');
});

// Register Page
app.get('/register', (req, res) => {
  res.render('register');
});
//to create the user 
app.post('/register',async(req, res)=>{
  const {username, password} = req.body;
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) values ($1, $2)', [username, hashedPassword]);
    res.redirect('/')
  }catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }

});
// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(401).send('Invalid username or password');
      return;
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).send('Invalid username or password');
      return;
    }
    req.session.userId = user.id;
    res.redirect(`/todos`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});
// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

// Todolist
app.get('/todos', async (req, res) => {
  const userId = req.session.userId;
  
  try {
    const todosResult = await db.query('SELECT * FROM todo WHERE user_id = $1', [userId]);
    const todos = todosResult.rows; 
    res.render('index', { todos }); // Pass the todos as an array to the view
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving the list');
  }
});

app.post('/todos', async (req, res) => {
  const { content } = req.body;
  const userId = req.session.userId;
  try {
    await db.query('INSERT INTO todo (content, completed,user_id) VALUES ($1, $2, $3)', [content, false,userId]);
    res.redirect('/todos');
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
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating todo');
  }
});

app.post('/todos/clear-completed', async(re,res)=>{
  try{
    await db.query('DELETE FROM todo WHERE completed = true');
    res.redirect('/todos')
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
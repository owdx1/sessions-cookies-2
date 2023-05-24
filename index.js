const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session)
const pool = require('./db.js');





const app = express();


app.use(express.json());
app.set('view engine' , 'ejs');
app.set('views' , 'views');


app.use(session({

    store: new pgSession(
        {
            pool:pool,
            tableName: 'sessions'
        }
    ),
    
    secret:"cookie sign",
    resave: false,
    saveUninitialized: false    
}));


const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {

    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json('Missing username or password');
    }

    try {
        // Retrieve the user from the database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(400).json('Invalid username or password');
        }

        const user = result.rows[0];

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json('Invalid username or password');
        }

        // Set the user's data in the session
        req.session.user = {
            id: user.id,
            username: user.username
        };

        return res.status(200).json('Logged in successfully');

    } catch (err) {
        console.error(err);
        return res.status(500).json('Internal server error');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { username } = req.session.user;
    res.render('dashboard', { username });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/', (req, res) => {
    res.render('index');
});


app.post('/register', async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;

    

    if(!username || !password) {
        return res.status(400).json('Missing username or password');
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store the new user in the database
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);

        // Set the new user's data in the session
        req.session.user = {
            id: result.rows[0].id,
            username: result.rows[0].username
        };

        return res.status(200).json('Registered and logged in successfully');

    } catch(err) {
        console.error(err);

        // Check if the error is about unique violation
        if(err.code === '23505'){
            return res.status(400).json('Username is already taken');
        }

        return res.status(500).json('Internal Server Error');
    }
});



app.get('/' , (req , res) =>{
    console.log(req.session.id);
    res.send('fu')

}) 

app.listen(5000,() =>{
    console.log("listenin on 5000");
})
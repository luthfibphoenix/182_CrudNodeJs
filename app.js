const express = require('express');
const path = require('path');
const app = express();
const todoRoutes = require('./router/tododb.js');
require('dotenv').config();
const port = process.env.PORT || 3000;

const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const authRoutes = require('./router/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');

// Set EJS sebagai template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middleware untuk parsing URL-encoded bodies dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware untuk melayani file statis
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi session
app.use(session({
    secret: process.env.SESSION_SECRET, // Gunakan secret key yang aman
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

// Rute aplikasi
app.use('/', authRoutes);
app.use('/todos', todoRoutes);

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {
        layout : 'layouts/main-layout'
    });
});

app.get('/contact', (req, res) => {
    res.render('contact', {
        layout : 'layouts/main-layout'
    });
});

app.get('/todo-view', (req, res) => {
    db.query('SELECT * FROM todos', (err, todos) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('todo', {
            layout: 'layouts/main-layout',
            todos: todos
        });
    });
});

// Middleware untuk menangani halaman tidak ditemukan (404)
app.use((req, res) => {
    res.status(404).send("404 - Halaman Tidak Ditemukan");
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); // Load env variables

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB Atlas using URL from .env
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Define Mongoose schema
const condetails = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    subject: String,
    message: String
});
const Contactdetails = mongoose.model("Contactdetails", condetails);

// Middlewares
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/aboutus', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'aboutus.html'));
});

app.get('/portfolio', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'portfolio.html'));
});

app.get('/editorial', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'editorial.html'));
});

app.get('/foodserve', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'foodserve.html'));
});

app.get('/bakedfoods', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bakedfoods.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'blog.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'books.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.post('/contact', (req, res) => {
    const myData = new Contactdetails(req.body);
    myData.save().then(() => {
        res.redirect('/contact');
    }).catch((err) => {
        console.error("Error saving to database:", err);
        res.status(400).send("Failed to save data.");
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

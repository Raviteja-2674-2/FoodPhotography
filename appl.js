const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // For environment variables
const morgan = require("morgan"); // For logging HTTP requests

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1/FoodProject";

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully to:", MONGODB_URI);
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
        // Exit process if database connection fails
        process.exit(1);
    });

// Define Schema for contact details
const contactDetailsSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: String,
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt fields

// Define Model
const ContactDetails = mongoose.model("Contactdetails", contactDetailsSchema); // Collection name will be 'contactdetails'

// --- Middleware ---
// HTTP request logger middleware
app.use(morgan('dev')); // 'dev' is a concise output colored by response status
// Serve static files from 'views' and 'static' directories
app.use(express.static(path.join(__dirname, 'views'))); // Assuming HTML files are directly in 'views'
app.use('/static', express.static(path.join(__dirname, 'static'))); // Assuming images and other static assets are in 'static'

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (if you plan to use API endpoints later)
app.use(express.json());

// --- Routes (Endpoints) ---

// Helper function to serve HTML files
const serveHtmlFile = (fileName) => (req, res) => {
    const filePath = path.join(__dirname, 'views', fileName);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error serving ${fileName}:`, err);
            res.status(404).send("Page not found.");
        }
    });
};

app.get('/', serveHtmlFile('home.html'));
app.get('/aboutus', serveHtmlFile('aboutus.html'));
app.get('/portfolio', serveHtmlFile('portfolio.html'));
app.get('/editorial', serveHtmlFile('editorial.html'));
app.get('/foodserve', serveHtmlFile('foodserve.html'));
app.get('/bakedfoods', serveHtmlFile('bakedfoods.html'));
app.get('/blog', serveHtmlFile('blog.html'));
app.get('/books', serveHtmlFile('books.html'));
app.get('/contact', serveHtmlFile('contact.html'));

// Handle form submission for contact page
app.post('/contact', (req, res) => {
    // Basic validation
    const { fname, email, subject, message } = req.body;
    if (!fname || !email || !subject || !message) {
        // You might want to render the form again with an error message
        return res.status(400).send("Please fill in all required fields.");
    }

    const newContact = new ContactDetails(req.body);
    newContact.save()
        .then(() => {
            console.log("Contact form data saved to database.");
            res.redirect('/contact?success=true'); // Redirect with a success flag
        })
        .catch(err => {
            console.error("Error saving contact form data:", err);
            // In a real app, you'd show a user-friendly error page or message
            res.status(500).send("There was an error saving your message. Please try again later.");
        });
});

// --- Error Handling Middleware (after all routes) ---
app.use((req, res, next) => {
    res.status(404).send("Sorry, that page doesn't exist!");
});

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).send('Something broke!'); // Generic error message for client
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server started successfully on port ${PORT}`);
    console.log(`Access your website at http://localhost:${PORT}`);
});
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config(); // Load .env variables

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ MONGO_URI not defined in environment variables.");
    process.exit(1);
}

// --- Database Connection ---
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB connected successfully to:", MONGO_URI);
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});

// --- Define Schema ---
const contactDetailsSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    lname: String,
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

const ContactDetails = mongoose.model("Contactdetails", contactDetailsSchema);

// --- Middleware ---
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "views")));
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- HTML Routes ---
const serveHtmlFile = (file) => (req, res) => {
    const filePath = path.join(__dirname, "views", file);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`❌ Error serving ${file}:`, err);
            res.status(404).send("Page not found.");
        }
    });
};

app.get("/", serveHtmlFile("home.html"));
app.get("/aboutus", serveHtmlFile("aboutus.html"));
app.get("/portfolio", serveHtmlFile("portfolio.html"));
app.get("/editorial", serveHtmlFile("editorial.html"));
app.get("/foodserve", serveHtmlFile("foodserve.html"));
app.get("/bakedfoods", serveHtmlFile("bakedfoods.html"));
app.get("/blog", serveHtmlFile("blog.html"));
app.get("/books", serveHtmlFile("books.html"));
app.get("/contact", serveHtmlFile("contact.html"));

// --- Contact Form POST ---
app.post("/contact", (req, res) => {
    const { fname, email, subject, message } = req.body;

    if (!fname || !email || !subject || !message) {
        return res.status(400).send("Please fill in all required fields.");
    }

    const newContact = new ContactDetails(req.body);

    newContact.save()
        .then(() => {
            console.log("✅ Contact form data saved.");
            res.redirect("/contact?success=true");
        })
        .catch(err => {
            console.error("❌ Error saving contact data:", err);
            res.status(500).send("Error saving message. Try again later.");
        });
});

// --- Error Handling ---
app.use((req, res) => {
    res.status(404).send("Sorry, that page doesn't exist!");
});

app.use((err, req, res, next) => {
    console.error("❌ Unexpected error:", err.stack);
    res.status(500).send("Something broke!");
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

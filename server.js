import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("."));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/autonext';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error('MongoDB connection error:', err));

// Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51Qexample..."); // Replace with your secret key

// Routes
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/submissions", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/submissions", async (req, res) => {
  try {
    const idsToDelete = req.body.ids.map(id => new mongoose.Types.ObjectId(id));
    await Contact.deleteMany({ _id: { $in: idsToDelete } });
    res.status(200).json({ success: true, message: "Selected submissions deleted." });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/admin", (req, res) => {
  res.sendFile("admin.html", { root: "." });
});

app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { service, price } = req.body;
    const amount = parseInt(price) * 100; // Convert rupees to paise

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr",
      metadata: { service },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ success: false, message: "Payment error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

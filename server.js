const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://aashishjadav0959:aashishjadav0959@cluster0.eucidr5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// Schema
const expenseSchema = new mongoose.Schema({
  username: String,
  amount: Number,
  category: String,
  date: Date,
});

const Expense = mongoose.model("Expense", expenseSchema);

// Routes
app.get("/expenses", async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

app.post("/expenses", async (req, res) => {
  const newExpense = new Expense(req.body);
  await newExpense.save();
  res.json("Expense Added Successfully!");
});

// ✅ Update Expense
app.put("/expenses/:id", async (req, res) => {
  await Expense.findByIdAndUpdate(req.params.id, req.body);
  res.json("Expense Updated Successfully!");
});

// ✅ Delete Expense
app.delete("/expenses/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json("Expense Deleted Successfully!");
});

app.listen(8081, () => {
  console.log("✅ Server running on port 8081");
});

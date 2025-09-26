import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function App() {
  const [form, setForm] = useState({
    username: "",
    amount: "",
    category: "",
    date: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");

  // Fetch expenses
  const fetchExpenses = async () => {
    const res = await fetch("https://expense-backend.onrender.com/expenses")
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Add / Update Expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:8081/expenses/${editingId}`
      : "http://localhost:8081/expenses";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ username: "", amount: "", category: "", date: "" });
    setEditingId(null);
    fetchExpenses();
  };

  // Edit
  const handleEdit = (expense) => {
    setForm({
      username: expense.username,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.split("T")[0],
    });
    setEditingId(expense._id);
  };

  // Delete
  const handleDelete = async (id) => {
    await fetch(`http://localhost:8081/expenses/${id}`, { method: "DELETE" });
    fetchExpenses();
  };

  // Category Filter
  const categories = ["Petrol", "Dawa", "Khana", "Shopping", "Travel", "Entertainment", "Other"];
  const filteredExpenses =
    filterCategory === "All"
      ? expenses
      : expenses.filter((e) => e.category === filterCategory);

  // Total Expense
  const totalExpense = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Pie Chart Data
  const categoryTotals = categories.map(cat =>
    filteredExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  );

  const pieData = {
    labels: categories,
    datasets: [
      {
        data: categoryTotals,
        backgroundColor: [
          "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
          "#8B5CF6", "#F43F5E", "#F97316"
        ],
        hoverOffset: 10
      }
    ]
  };

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-8">💰 Expense Tracker</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {editingId ? "Update Expense" : "Add Expense"}
        </button>
      </form>

      {/* Category Filter & Total */}
      <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl w-full mb-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Filter by Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="font-semibold text-gray-700 text-lg">
          Total Expense: ₹{totalExpense}
        </div>
        <button
          onClick={handlePrint}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          🖨️ Print
        </button>
      </div>

      {/* Table */}
      <div className="w-full max-w-4xl overflow-x-auto shadow-lg rounded-lg mb-8">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp, i) => (
              <tr key={i} className="border-b hover:bg-gray-100 transition">
                <td className="py-3 px-4">{exp.username}</td>
                <td className="py-3 px-4">₹{exp.amount}</td>
                <td className="py-3 px-4">{exp.category}</td>
                <td className="py-3 px-4">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No expenses found. Add one above 👆
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pie Chart */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">📊 Category-wise Expense</h2>
        <Pie data={pieData} />
      </div>
    </div>
  );
}

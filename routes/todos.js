const express = require("express");
const Todo = require("../models/Todo");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Every route below this line requires the user to be logged in
router.use(requireAuth);

// GET /api/todos - get all todos belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch todos." });
  }
});

// POST /api/todos - create a new todo
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Todo text is required." });
    }

    const todo = await Todo.create({ text: text.trim(), user: req.userId });
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create todo." });
  }
});

// PUT /api/todos/:id - update a todo (text and/or completed)
router.put("/:id", async (req, res) => {
  try {
    const { text, completed } = req.body;

    const todo = await Todo.findOne({ _id: req.params.id, user: req.userId });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }

    if (text !== undefined) todo.text = text.trim();
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update todo." });
  }
});

// DELETE /api/todos/:id - delete a todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found." });
    }
    res.json({ message: "Todo deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete todo." });
  }
});

module.exports = router;

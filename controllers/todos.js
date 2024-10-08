const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Todo = require('../models/todos.js');
const router = express.Router();

router.use(verifyToken);

router.post('/', async (req, res) => {
    try {
        req.body.creator = req.user._id;
        const todo = await Todo.create(req.body);
        todo._doc.creator = req.user;

        res.status(201).json(todo);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({}).populate('creator').sort({ createdAt: 'desc' });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/myTodos', async (req, res) => {
    try {
        const todos = await Todo.find({}).populate('creator').sort({ createdAt: 'desc' });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId).populate('creator').populate('comments.commentor');
        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId);

        // Update todo:
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.todoId,
            req.body,
            { new: true }
        );

        // Issue JSON response:
        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.delete('/:todoId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId);

        const deletedTodo = await Todo.findByIdAndDelete(req.params.todoId);
        res.status(200).json(deletedTodo);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/:todoId/comments', async (req, res) => {
    try {
        req.body.commentor = req.user._id;
        const todo = await Todo.findById(req.params.todoId);
        todo.comments.push(req.body);
        await todo.save();

        console.log(todo)

        // Find the newly created comment:
        const newComment = todo.comments[todo.comments.length - 1];

        newComment._doc.commentor = req.user;

        // Respond with the newComment:
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/:todoId/comments/:commentId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId);
        const comment = todo.comments.id(req.params.commentId);
        comment.text = req.body.text;
        await todo.save();
        res.status(200).json({ comment });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/:todoId/comments/:commentId', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.todoId);
        todo.comments.remove({ _id: req.params.commentId });
        await todo.save();
        res.status(200).json({ todo });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
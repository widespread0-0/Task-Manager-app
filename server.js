const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ AWS CONFIG (use your NEW keys)
AWS.config.update({
  region: "eu-north-1",
 
});


const dynamo = new AWS.DynamoDB.DocumentClient();

// TEST
app.get("/", (req, res) => {
  res.send("🚀 Task Manager API is running");
});

// ADD TASK
app.post("/add-task", async (req, res) => {
  const { task, dueDate } = req.body;

  const params = {
    TableName: "Tasks",
    Item: {
      taskid: Date.now().toString(),
      task,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || null
    }
  };

  try {
    await dynamo.put(params).promise();
    res.json({ message: "Task added" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// GET TASKS
app.get("/tasks", async (req, res) => {
  try {
    const data = await dynamo.scan({ TableName: "Tasks" }).promise();
    res.json(data.Items);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// COMPLETE TASK
app.put("/complete-task/:id", async (req, res) => {
  const taskid = req.params.id;

  const params = {
    TableName: "Tasks",
    Key: { taskid },
    UpdateExpression: "set completed = :c",
    ExpressionAttributeValues: {
      ":c": true
    }
  };

  try {
    await dynamo.update(params).promise();
    res.json({ message: "Task completed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to complete task" });
  }
});

// DELETE TASK
app.delete("/delete-task/:id", async (req, res) => {
  const taskid = req.params.id;

  const params = {
    TableName: "Tasks",
    Key: { taskid }
  };

  try {
    await dynamo.delete(params).promise();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// ✏️ EDIT TASK
app.put("/edit-task/:id", async (req, res) => {
  const taskid = req.params.id;
  const { task, dueDate } = req.body;

  const params = {
    TableName: "Tasks",
    Key: { taskid },
    UpdateExpression: "set task = :t, dueDate = :d",
    ExpressionAttributeValues: {
      ":t": task,
      ":d": dueDate || null
    }
  };

  try {
    await dynamo.update(params).promise();
    res.json({ message: "Task updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// START SERVER
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
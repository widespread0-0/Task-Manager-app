const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// AWS Configuration
AWS.config.update({
  region: "eu-north-1",
  
});

// DynamoDB Client
const dynamo = new AWS.DynamoDB.DocumentClient();

//  Add Task
app.post("/add-task", async (req, res) => {
  const { task, dueDate } = req.body;
  const now = new Date().toISOString();

  const params = {
    TableName: "Tasks",
    Item: {
      taskid: Date.now().toString(),
      task: task,
      completed: false,
      createdAt: now,
      dueDate: dueDate || null
    }
  };

  try {
    await dynamo.put(params).promise();
    res.json({ message: "Task saved to AWS!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save task" });
  }
});

// Get Tasks
app.get("/tasks", async (req, res) => {
  try {
    const data = await dynamo.scan({ TableName: "Tasks" }).promise();
    res.json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// MARK TASK AS COMPLETED
app.put("/complete-task/:id", async (req, res) => {
  const taskid = req.params.id;
  const now = new Date().toISOString();

  const params = {
    TableName: "Tasks",
    Key: { taskid: taskid },
    UpdateExpression: "set completed = :c, completedAt = :ca",
    ExpressionAttributeValues: {
      ":c": true,
      ":ca": now
    }
  };

  try {
    await dynamo.update(params).promise();
    res.json({ message: "Task marked as completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});


// DELETE TASK
app.delete("/delete-task/:id", async (req, res) => {
  const taskid = req.params.id;

  const params = {
    TableName: "Tasks",
    Key: { taskid: taskid }
  };

  try {
    await dynamo.delete(params).promise();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});


// Test route
app.get("/", (req, res) => {
  res.send("🚀 Task Manager API is running");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
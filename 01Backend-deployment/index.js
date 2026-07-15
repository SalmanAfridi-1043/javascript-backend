require("dotenv").config();
const express = require("express");
const app = express();

const data = {
  status: "success",
  message: "User data retrieved successfully",
  timestamp: "2026-07-15T12:30:00Z",
  data: {
    user: {
      id: 101,
      name: "Ali Khan",
      email: "ali.khan@example.com",
      age: 22,
      isActive: true,
      roles: ["student", "developer"],
    },
    profile: {
      country: "Pakistan",
      city: "Lahore",
      skills: ["JavaScript", "Python", "React", "JSON"],
    },
    projects: [
      {
        id: 1,
        title: "Portfolio Website",
        status: "completed",
        technologies: ["HTML", "CSS", "JavaScript"],
      },
      {
        id: 2,
        title: "Weather App",
        status: "in_progress",
        technologies: ["React", "API"],
      },
    ],
  },
};

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Salman with backend");
});

app.get("/test", (req, res) => {
  res.send("<h1>Backend Developement with chai our code</h1>");
});

app.get("/api", (req, res) => {
  res.json(data);
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`);
});

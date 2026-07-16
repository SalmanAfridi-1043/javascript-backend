import express from "express";

const app = express();

const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Hello world");
// });

// create an array of jokes (copilot)
app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: "1",
      title: "Joke 1",
      content: "This is a joke",
    },
    {
      id: "2",
      title: "Joke 2",
      content: "This is a joke 2",
    },
    {
      id: "3",
      title: "Joke 3",
      content: "This is a joke 3",
    },
    {
      id: "4",
      title: "Joke 4",
      content: "This is a joke 4",
    },
    {
      id: "5",
      title: "Joke 5",
      content: "This is a joke 5",
    },
  ];

  res.send(jokes);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

import "./App.css";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios
      .get("/api/jokes")
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div>
      <h1>Jokes with Chai our code</h1>

      <h2>Jokes Counte: {jokes.length}</h2>

      <div>
        {jokes.map((joke) => (
          <div key={joke.id}>
            <h3>Title : {joke.title}</h3>
            <h3>Content : {joke.content}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

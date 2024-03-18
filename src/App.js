import React, { useState, useEffect } from "react";
import { apiRequest, mockingEnabled } from "./api";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  console.log("debug", process.env.NODE_ENV);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Fetch todos from the default base URL
        const todosData = await apiRequest("/todos");
        setTodos(todosData?.todos);
      } catch (error) {
        setError(error);
      }
    };

    fetchTodos();
  }, []);

  const handleFetchError = async () => {
    try {
      // Pass options directly without nesting them under 'options' key
      await apiRequest("/todos", { options: { mockError: true } });
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div className="app">
      <h1>Todos</h1>
      {error ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.todo}</li>
            ))}
          </ul>
          {mockingEnabled && <button onClick={handleFetchError}>Simulate Error</button>}
          
        </>
      )}
    </div>
  );
};

export default App;

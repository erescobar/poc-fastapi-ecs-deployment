import React, { useState } from 'react';
import './App.css';

function App() {
  const [getResponse, setGetResponse] = useState('');
  const [postResponse, setPostResponse] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleGetRequest = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/greetings`);
      const data = await response.json();
      setGetResponse(data.message);
    } catch (error) {
      setGetResponse('Error: Could not connect to API');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/greetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: inputValue }),
      });
      const data = await response.json();
      setPostResponse(data.message);
    } catch (error) {
      setPostResponse('Error: Could not connect to API');
    }
  };

  return (
    <div className="App">
      <h1>Hello POC</h1>

      <div>
        <button onClick={handleGetRequest}>Call GET Greetings</button>
        {getResponse && <p>{getResponse}</p>}
      </div>

      <form onSubmit={handlePostSubmit} className="form-inline">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your name"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
        >
          Submit
        </button>
      </form>

      {postResponse && <p>{postResponse}</p>}
    </div>
  );
}

export default App;

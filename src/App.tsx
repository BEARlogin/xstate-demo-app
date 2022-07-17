import './App.css';
import React from 'react'
import LoginForm from "./features/login/LoginForm";
import TrafficLights from "./features/traffic-lights/TraffikLights";

function App() {
  return (
    <div className="App">
      <TrafficLights />
    </div>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/dashboard"; 
import Payment from "./components/payment";
import Bills from "./components/billGenerator";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/Bills" element={<Bills />}/>
      </Routes>
    </Router>
  );
}

export default App;

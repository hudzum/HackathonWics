import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import Dashboard from './DashBoard'; // Example of a protected page
import { Button } from './components/ui/button';

const App: React.FC = () => {
  return (
   
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
    
  );
};

export default App;
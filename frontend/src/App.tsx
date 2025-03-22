import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import Dashboard from './DashBoard'; // Example of a protected page
import UserProfile from './UserProfile';
import { AuthContext, AuthContextProvider } from './auth/context';
const App: React.FC = () => {
  return (
   <AuthContextProvider>
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/dashboard" element={<UserProfile />} />
      </Routes>
    </Router>
    </AuthContextProvider>
  );
};

export default App;
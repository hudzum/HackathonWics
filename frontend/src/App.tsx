import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import Dashboard from './DashBoard'; // Example of a protected page
import UserProfile from './UserProfile';
import { AuthContext, AuthContextProvider } from './auth/context';
import FrontPage from './FrontPage';
import { ThemeProvider } from './components/ui/theme-provider';

const App: React.FC = () => {
  return (
   <AuthContextProvider>
    <ThemeProvider>
    <Router>
    
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/dashboard" element={<UserProfile />} />
      </Routes>
    </Router>
    </ThemeProvider>
    </AuthContextProvider>
  );
};

export default App;
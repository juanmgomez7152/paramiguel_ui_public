// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SignIn from './sign-in/SignIn';
import MarketingPage from './marketing-page/MarketingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="" element={<MarketingPage />} />
        <Route path="/sign-in" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
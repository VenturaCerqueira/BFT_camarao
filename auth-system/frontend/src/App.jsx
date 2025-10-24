import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import TankRegistration from './components/TankRegistration';
import ShrimpRegistration from './components/ShrimpRegistration';
import WaterQualityRegistration from './components/WaterQualityRegistration';
import FeedingRegistration from './components/FeedingRegistration';
import ExpenseRegistration from './components/ExpenseRegistration';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tank-registration" element={<TankRegistration />} />
          <Route path="/shrimp-registration" element={<ShrimpRegistration />} />
          <Route path="/water-quality-registration" element={<WaterQualityRegistration />} />
          <Route path="/feeding-registration" element={<FeedingRegistration />} />
          <Route path="/expense-registration" element={<ExpenseRegistration />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

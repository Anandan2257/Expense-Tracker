import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Stats from './pages/Stats';
import Budget from './pages/Budget';
import Account from './pages/Account';
import { seedCategories } from './utils/api';

function AppContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      seedCategories().catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-logo">
            <div className="auth-logo-icon">💰</div>
            <h1 className="auth-app-name">Expense Tracker</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-center" autoClose={2000} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

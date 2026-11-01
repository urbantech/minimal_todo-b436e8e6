import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider, useAINativeAuth } from '@ainative/react-sdk';
import LoginPage from './components/LoginPage';
import UserManagementPage from './components/UserManagementPage';
import CreateToDoPage from './components/CreateToDoPage';
import CompleteToDoPage from './components/CompleteToDoPage';
import DeleteToDoPage from './components/DeleteToDoPage';
import ListToDoItemsPage from './components/ListToDoItemsPage';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ainative_token');
    if (!token) {
      setLoading(false);
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('ainative_token');
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
  };

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-blue-900 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-lg font-bold">minimal_todo</h1>
              <div className="space-x-4">
                <Link to="/user-management" className="hover:text-blue-200">User Management</Link>
                <Link to="/create-to-do" className="hover:text-blue-200">Create To-Do</Link>
                <Link to="/complete-to-do" className="hover:text-blue-200">Complete To-Do</Link>
                <Link to="/delete-to-do" className="hover:text-blue-200">Delete To-Do</Link>
                <Link to="/list-to-do-items" className="hover:text-blue-200">List To-Do Items</Link>
                <button onClick={handleLogout} className="hover:text-blue-200">Logout</button>
              </div>
            </div>
          </nav>
          <div className="p-4">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && (
              <Routes>
                <Route path="/login" element={<LoginPage setLoading={setLoading} setError={setError} />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/user-management" element={<ProtectedRoute><UserManagementPage /></ProtectedRoute>} />
                <Route path="/create-to-do" element={<ProtectedRoute><CreateToDoPage /></ProtectedRoute>} />
                <Route path="/complete-to-do" element={<ProtectedRoute><CompleteToDoPage /></ProtectedRoute>} />
                <Route path="/delete-to-do" element={<ProtectedRoute><DeleteToDoPage /></ProtectedRoute>} />
                <Route path="/list-to-do-items" element={<ProtectedRoute><ListToDoItemsPage /></ProtectedRoute>} />
              </Routes>
            )}
          </div>
        </div>
      </BrowserRouter>
    </AINativeProvider>
  );
};

export default App;
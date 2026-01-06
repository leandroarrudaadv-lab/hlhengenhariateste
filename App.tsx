
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Photos from './pages/Photos';
import Contracts from './pages/Contracts';
import Purchases from './pages/Purchases';
import RDOPage from './pages/RDOPage';
import CollaboratorDetails from './pages/CollaboratorDetails';
import Collaborators from './pages/Collaborators';
import Layout from './components/Layout';

import { CollaboratorProvider } from './contexts/CollaboratorContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <CollaboratorProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/photos" element={<Photos />} />
                        <Route path="/contracts" element={<Contracts />} />
                        <Route path="/purchases" element={<Purchases />} />
                        <Route path="/rdo" element={<RDOPage />} />
                        <Route path="/collaborators" element={<Collaborators />} />
                        <Route path="/collaborator/:id" element={<CollaboratorDetails />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </CollaboratorProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;

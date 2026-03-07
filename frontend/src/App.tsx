import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { lightTheme, darkTheme } from './styles/theme';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import AuthNavbar from './components/common/AuthNavbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import TopicDetailPage from './pages/TopicDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { mode } = useThemeStore();
  const theme = mode === 'light' ? lightTheme : darkTheme;
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show global loading while checking auth
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingSpinner message="Loading application..." />
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page with AuthNavbar */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <>
                    <AuthNavbar />
                    <LandingPage />
                  </>
                )
              }
            />

            {/* Public Auth Routes with AuthNavbar */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <>
                    <AuthNavbar />
                    <LoginPage />
                  </>
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/home" replace />
                ) : (
                  <>
                    <AuthNavbar />
                    <RegisterPage />
                  </>
                )
              }
            />
            
            {/* Protected Routes with Main Navbar */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/home"
                element={
                  <>
                    <Navbar />
                    <HomePage />
                  </>
                }
              />
              <Route
                path="/topics"
                element={
                  <>
                    <Navbar />
                    <TopicsPage />
                  </>
                }
              />
              <Route
                path="/topics/:id"
                element={
                  <>
                    <Navbar />
                    <TopicDetailPage />
                  </>
                }
              />
              <Route
                path="/posts/:id"
                element={
                  <>
                    <Navbar />
                    <PostDetailPage />
                  </>
                }
              />
              <Route
                path="/profile"
                element={
                  <>
                    <Navbar />
                    <ProfilePage />
                  </>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <>
                    <Navbar />
                    <ProfilePage />
                  </>
                }
              />
              <Route
                path="/search"
                element={
                  <>
                    <Navbar />
                    <SearchPage />
                  </>
                }
              />
            </Route>
            
            {/* Catch all - redirect to appropriate home */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme={mode} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
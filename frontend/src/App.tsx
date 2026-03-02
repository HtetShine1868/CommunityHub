import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { lightTheme, darkTheme } from './styles/theme';
import { useThemeStore } from './store/themeStore';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import TopicsPage from './pages/TopicsPage';
import TopicDetailPage from './pages/TopicDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import TestPage from './pages/TestPage';
function App() {
  const { mode } = useThemeStore();
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (


    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:id" element={<TopicDetailPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
            <Route path="/test" element={<TestPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme={mode} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
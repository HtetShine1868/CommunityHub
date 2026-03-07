import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  Divider,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  Fade,
  Zoom,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  GitHub,
  Facebook,
  ArrowForward,
  PersonAdd,
  Login as LoginIcon,
  Key,
  Waves,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    
    try {
      await login(data);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      setShowSuccess(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic here
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `radial-gradient(circle at 10% 20%, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 90%)`,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      {[...Array(20)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
          }}
          animate={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          sx={{
            position: 'absolute',
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.palette.secondary.light} 0%, transparent 70%)`,
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Logo/Header with Animation */}
            <Zoom in={true} style={{ transitionDelay: '100ms' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                </motion.div>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Sign in to continue to Community Hub
                </Typography>
              </Box>
            </Zoom>

            {/* Error Alert with Animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-icon': {
                        alignItems: 'center',
                      },
                    }}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setError(null)}
                      >
                        <span style={{ fontSize: '1.2rem' }}>×</span>
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: theme.palette.success.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Key sx={{ fontSize: 50, color: 'white' }} />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field - Enhanced Visibility */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email 
                          color={errors.email ? 'error' : emailValue ? 'primary' : 'action'} 
                        />
                      </InputAdornment>
                    ),
                    sx: {
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '& input': {
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        '&::placeholder': {
                          color: theme.palette.text.secondary,
                          opacity: 0.7,
                          fontWeight: 400,
                        },
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                      '&.Mui-error': {
                        color: theme.palette.error.main,
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      },
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: theme.palette.divider,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Password Field - Enhanced Visibility */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock 
                          color={errors.password ? 'error' : passwordValue ? 'primary' : 'action'} 
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '& input': {
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        '&::placeholder': {
                          color: theme.palette.text.secondary,
                          opacity: 0.7,
                          fontWeight: 400,
                        },
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: theme.palette.primary.main,
                      },
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      },
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: theme.palette.divider,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </motion.div>

              {/* Password Strength Indicator */}
              {passwordValue && passwordValue.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {[1, 2, 3].map((level) => (
                        <Box
                          key={level}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: passwordValue.length >= level * 2 
                              ? passwordValue.length >= 8 
                                ? theme.palette.success.main
                                : theme.palette.warning.main
                              : theme.palette.action.disabledBackground,
                            transition: 'all 0.3s',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {passwordValue.length < 6 && 'Weak password'}
                      {passwordValue.length >= 6 && passwordValue.length < 8 && 'Medium password'}
                      {passwordValue.length >= 8 && 'Strong password'}
                    </Typography>
                  </Box>
                </motion.div>
              )}

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 2,
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 0 },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('rememberMe')}
                        color="primary"
                        sx={{
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href="#"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      '&:hover': {
                        color: theme.palette.secondary.main,
                        textDecoration: 'underline',
                        transform: 'translateX(2px)',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>
              </motion.div>

              {/* Login Button with Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading || !isValid}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.8,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                    },
                    '&.Mui-disabled': {
                      background: theme.palette.action.disabledBackground,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Waves />
                      </motion.div>
                      Signing in...
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>

              {/* Social Login */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2, fontWeight: 500 }}>
                      Or continue with
                    </Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      justifyContent: 'center',
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    {[
                      { provider: 'Google', icon: Google, color: '#db4437' },
                      { provider: 'GitHub', icon: GitHub, color: '#333' },
                      { provider: 'Facebook', icon: Facebook, color: '#4267B2' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.provider}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ flex: 1 }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<item.icon />}
                          onClick={() => handleSocialLogin(item.provider)}
                          fullWidth
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: item.color,
                            color: item.color,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: item.color,
                              backgroundColor: `${item.color}10`,
                              boxShadow: `0 4px 12px ${item.color}40`,
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          {item.provider}
                        </Button>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </motion.div>

              {/* Register Link with Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Don't have an account?{' '}
                    <Link
                      component={RouterLink}
                      to="/register"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          color: theme.palette.secondary.main,
                          '& .arrow': {
                            transform: 'translateX(6px)',
                          },
                        },
                      }}
                    >
                      Create account
                      <PersonAdd 
                        fontSize="small" 
                        className="arrow" 
                        sx={{ 
                          transition: 'transform 0.3s',
                        }} 
                      />
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
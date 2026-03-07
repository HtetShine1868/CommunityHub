import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Implement social login logic here
    console.log(`Logging in with ${provider}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Logo/Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                  }}
                >
                  Welcome Back
                </Typography>
              </motion.div>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue to Community Hub
              </Typography>
            </Box>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
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
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Field */}
              <TextField
                {...register('email')}
                fullWidth
                label="Email"
                type="email"
                placeholder="john@example.com"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email 
                        color={errors.email ? 'error' : emailFocused ? 'primary' : 'action'} 
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                {...register('password')}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock 
                        color={errors.password ? 'error' : passwordFocused ? 'primary' : 'action'} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  },
                }}
              />

              {/* Remember Me & Forgot Password */}
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
                      }}
                    />
                  }
                  label="Remember me"
                />
                <Link
                  href="#"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !isValid}
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Social Login */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
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
                  <Button
                    variant="outlined"
                    startIcon={<Google />}
                    onClick={() => handleSocialLogin('Google')}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#db4437',
                      color: '#db4437',
                      '&:hover': {
                        borderColor: '#db4437',
                        backgroundColor: 'rgba(219, 68, 55, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Google
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<GitHub />}
                    onClick={() => handleSocialLogin('GitHub')}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#333',
                      color: '#333',
                      '&:hover': {
                        borderColor: '#333',
                        backgroundColor: 'rgba(51, 51, 51, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    GitHub
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Facebook />}
                    onClick={() => handleSocialLogin('Facebook')}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: '#4267B2',
                      color: '#4267B2',
                      '&:hover': {
                        borderColor: '#4267B2',
                        backgroundColor: 'rgba(66, 103, 178, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    Facebook
                  </Button>
                </Box>
              </Box>

              {/* Register Link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': {
                        '& .arrow': {
                          transform: 'translateX(4px)',
                        },
                      },
                    }}
                  >
                    Create account
                    <PersonAdd fontSize="small" className="arrow" sx={{ transition: 'transform 0.2s' }} />
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;
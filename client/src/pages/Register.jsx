import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 20,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
}));

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(formData);
      navigate('/inventory');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StyledPaper>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Create Account
            </Typography>
            
            {error && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: '100%' }}
            >
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 4,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  background: 'linear-gradient(45deg, #007AFF, #5856D6)',
                  '&:hover': {
                    boxShadow: 'none',
                    background: 'linear-gradient(45deg, #0056b3, #4240b3)',
                  },
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, color: 'grey.600' }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#007AFF',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </StyledPaper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Register;

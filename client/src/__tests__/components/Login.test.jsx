import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import Login from '../../components/Auth/Login';
import { useAuth } from '../../context/AuthContext';
import { mockUser } from '../utils/fixtures';
import { waitForLoadingToFinish } from '../utils/testHelpers';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  const defaultProps = {};

  const renderLogin = (props = {}) => {
    return render(<Login {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      user: null,
      loading: false
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it('disables submit button while loading', () => {
      useAuth.mockImplementation(() => ({
        login: mockLogin,
        user: null,
        loading: true
      }));

      renderLogin();
      
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    it('handles successful login', async () => {
      mockLogin.mockResolvedValueOnce({ user: mockUser });
      renderLogin();
      
      await userEvent.type(screen.getByLabelText(/email address/i), mockUser.email);
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitForLoadingToFinish();
      
      expect(mockLogin).toHaveBeenCalledWith({
        email: mockUser.email,
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles login error', async () => {
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
      });
      
      renderLogin();
      
      await userEvent.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      renderLogin();
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      renderLogin();
      
      await userEvent.type(screen.getByLabelText(/email address/i), 'invalidemail');
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to register page', () => {
      renderLogin();
      
      fireEvent.click(screen.getByText(/don't have an account\? sign up/i));
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('redirects to dashboard if already logged in', () => {
      useAuth.mockImplementation(() => ({
        login: mockLogin,
        user: mockUser,
        loading: false
      }));

      renderLogin();
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

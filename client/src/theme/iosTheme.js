import { createTheme } from '@mui/material/styles';

export const iosTheme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // iOS blue
      light: '#5856D6', // iOS purple
      dark: '#0056b3',
    },
    secondary: {
      main: '#34C759', // iOS green
      light: '#5EDA82',
      dark: '#248A3D',
    },
    error: {
      main: '#FF3B30', // iOS red
    },
    warning: {
      main: '#FF9500', // iOS orange
    },
    info: {
      main: '#5856D6', // iOS purple
    },
    success: {
      main: '#34C759', // iOS green
    },
    grey: {
      50: '#F2F2F7',
      100: '#E5E5EA',
      200: '#D1D1D6',
      300: '#C7C7CC',
      400: '#AEAEB2',
      500: '#8E8E93',
      600: '#636366',
      700: '#48484A',
      800: '#3A3A3C',
      900: '#2C2C2E',
    },
    background: {
      default: '#F2F2F7', // iOS light grey background
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '34px',
      fontWeight: 700,
      letterSpacing: '-0.4px',
    },
    h2: {
      fontSize: '28px',
      fontWeight: 700,
      letterSpacing: '-0.4px',
    },
    h3: {
      fontSize: '22px',
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
    subtitle1: {
      fontSize: '17px',
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
    subtitle2: {
      fontSize: '15px',
      fontWeight: 500,
      letterSpacing: '-0.4px',
    },
    body1: {
      fontSize: '17px',
      letterSpacing: '-0.4px',
    },
    body2: {
      fontSize: '15px',
      letterSpacing: '-0.4px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.4px',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: '17px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            opacity: 0.9,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#F2F2F7',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: '#007AFF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007AFF',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 28,
        },
        outlined: {
          borderWidth: '1.5px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '16px 0',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '17px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.08)',
          },
        },
      },
    },
  },
});

export default iosTheme;

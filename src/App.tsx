import { FC } from 'react';
import { Container, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { TokenManager } from './components/TokenManager';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThemeProvider as CustomThemeProvider, useTheme as useCustomTheme } from './context/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';

const AppContent: FC = () => {
  const { isDarkMode } = useCustomTheme();

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#00BCD4', // Cyan
        light: '#4DD0E1',
        dark: '#0097A7',
      },
      secondary: {
        main: '#006064', // Dark Turquoise
        light: '#00838F',
        dark: '#004D40',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1E1E1E' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: isDarkMode 
              ? 'linear-gradient(45deg, #1E1E1E 30%, #2A2A2A 90%)'
              : 'linear-gradient(45deg, #FFFFFF 30%, #F5F5F5 90%)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 24px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background: 'linear-gradient(45deg, #00BCD4 30%, #006064 90%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(45deg, #0097A7 30%, #004D40 90%)',
            },
          },
          outlined: {
            borderColor: '#00BCD4',
            color: '#00BCD4',
            '&:hover': {
              borderColor: '#006064',
              color: '#006064',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover fieldset': {
                borderColor: '#00BCD4',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)'
          : 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)',
      }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <TokenManager />
        </Container>
        <Footer />
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </ThemeProvider>
  );
};

const App: FC = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;

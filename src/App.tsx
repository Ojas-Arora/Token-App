import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TokenManager } from './components/TokenManager';
import { Container, Box, Typography, AppBar, Toolbar, ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9945FF',
    },
    secondary: {
      main: '#14F195',
    },
  },
});

const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Solana Token Manager
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WalletMultiButton className="wallet-adapter-button" />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <TokenManager />
        </Container>

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
          theme="dark"
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;

import { WalletMultiButton } from './components/WalletMultiButton';
import { TokenManager } from './components/TokenManager';
import { Container, AppBar, Toolbar, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#512da8',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Solana Token Manager
            </Typography>
            <WalletMultiButton />
          </Toolbar>
        </AppBar>
        
        <Container component="main" sx={{ mt: 4, mb: 4 }}>
          <TokenManager />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

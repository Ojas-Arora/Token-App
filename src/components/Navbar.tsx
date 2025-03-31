import { AppBar, Toolbar, Typography, IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode, toggleTheme } = useCustomTheme();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: isDarkMode 
          ? 'linear-gradient(45deg, #1a1a1a 30%, #2a2a2a 90%)'
          : 'linear-gradient(45deg, #ffffff 30%, #f5f5f5 90%)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      <Toolbar>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #9945FF 30%, #14F195 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Solana Token Manager
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              '&:hover': {
                color: isDarkMode ? '#fff' : '#000',
              },
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          
          <Box
            sx={{
              '& .wallet-adapter-button': {
                background: 'linear-gradient(45deg, #9945FF 30%, #14F195 90%)',
                borderRadius: '8px',
                padding: '8px 24px',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #7a35d9 30%, #0fb880 90%)',
                },
              },
            }}
          >
            <WalletMultiButton />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 
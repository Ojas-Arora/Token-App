import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

export const Footer = () => {
  const { isDarkMode } = useCustomTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: { xs: 2, sm: 0 } }}
            >
              © {new Date().getFullYear()} Solana Token App. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <IconButton
                component={Link}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  '&:hover': {
                    color: isDarkMode ? '#fff' : '#000',
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}; 
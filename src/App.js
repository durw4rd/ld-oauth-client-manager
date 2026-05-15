import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ApiTokenForm from './components/apiTokenForm.js';
import HandleOauthClients from './components/handleOauthClients.js';
import ldTheme from './theme/ldTheme';
import './App.css';

const logoSrc = `${process.env.PUBLIC_URL}/brand/launchdarkly-primary-white.svg`;

function App() {
  return (
    <ThemeProvider theme={ldTheme}>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="header"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, sm: 4 },
                flexWrap: 'wrap',
              }}
            >
              <Box
                component="img"
                src={logoSrc}
                alt="LaunchDarkly"
                sx={{
                  width: { xs: 160, sm: 220 },
                  minWidth: 150,
                  height: 'auto',
                  display: 'block',
                }}
              />
              <Box sx={{ textAlign: 'left', flex: '1 1 240px' }}>
                <Typography
                  variant="h1"
                  component="h1"
                  className="ld-page-title"
                  sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem' }, mb: 0.5 }}
                >
                  OAuth client manager
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage OAuth 2.0 clients for your LaunchDarkly account via the REST API.
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" component="main" sx={{ flex: 1, py: 4, px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            <ApiTokenForm />
            <HandleOauthClients />
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

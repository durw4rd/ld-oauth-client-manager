import { createTheme } from '@mui/material/styles';

const ldBlack = '#191919';
const ldGray06 = '#2C2C2C';
const ldGray05 = '#414042';
const ldGray03 = '#A7A9AC';
const ldBlue = '#405BFF';
const ldBlueLight = '#7084FF';
const ldLime = '#DDFF46';

const ldTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: ldBlue,
      light: ldBlueLight,
      dark: '#2A3BA6',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ldLime,
      contrastText: ldBlack,
    },
    background: {
      default: ldBlack,
      paper: ldGray06,
    },
    text: {
      primary: '#FFFFFF',
      secondary: ldGray03,
    },
    divider: ldGray05,
    error: {
      main: '#FF6B6B',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Sora', system-ui, sans-serif",
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h2: { fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Sora', system-ui, sans-serif", fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: ldBlack,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: ldBlueLight,
          },
        },
        containedSecondary: {
          color: ldBlack,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
        InputLabelProps: { shrink: true },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: ldGray05,
          borderRadius: 8,
          '&:hover': {
            backgroundColor: '#4a4a4c',
          },
          '&.Mui-focused': {
            backgroundColor: ldGray05,
          },
        },
        underline: {
          '&:before, &:after': {
            display: 'none',
          },
        },
        input: {
          color: '#FFFFFF',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: ldGray03,
          '&.Mui-focused': {
            color: ldBlueLight,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: ldGray05,
          color: ldGray03,
        },
        head: {
          fontFamily: "'Sora', system-ui, sans-serif",
          fontWeight: 700,
          color: '#FFFFFF',
          backgroundColor: ldGray06,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: `1px solid ${ldGray05}`,
          borderRadius: 8,
        },
      },
    },
  },
});

export default ldTheme;

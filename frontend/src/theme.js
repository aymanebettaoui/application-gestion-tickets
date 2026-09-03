import {
  createTheme,
} from '@mui/material/styles'


const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#6870fa',
    },

    secondary: {
      main: '#4cceac',
    },

    background: {
      default: '#141b2d',
      paper: '#1f2a40',
    },
  },

  typography: {
    fontFamily:
      '"Inter", Arial, sans-serif',

    h1: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 700,
    },

    h2: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 700,
    },

    h3: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },

    h4: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 700,
    },

    h5: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 600,
    },

    h6: {
      fontFamily:
        '"Playfair Display", serif',
      fontWeight: 600,
    },

    subtitle1: {
      fontFamily:
        '"Inter", sans-serif',
    },

    subtitle2: {
      fontFamily:
        '"Inter", sans-serif',
    },

    body1: {
      fontFamily:
        '"Inter", sans-serif',
    },

    body2: {
      fontFamily:
        '"Inter", sans-serif',
    },

    button: {
      fontFamily:
        '"Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },

    caption: {
      fontFamily:
        '"Inter", sans-serif',
    },

    overline: {
      fontFamily:
        '"Inter", sans-serif',
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily:
            '"Inter", sans-serif',
          fontWeight: 500,
        },
      },
    },

    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily:
            '"Inter", sans-serif',
        },
      },
    },
  },
})


export default theme
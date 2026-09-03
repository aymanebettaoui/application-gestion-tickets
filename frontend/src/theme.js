import { createTheme } from '@mui/material/styles'

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
    fontFamily: 'Arial, sans-serif',
  },
})

export default theme
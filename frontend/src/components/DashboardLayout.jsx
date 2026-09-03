import {
  Box,
} from '@mui/material'

import {
  Outlet,
} from 'react-router-dom'

import Sidebar from './Sidebar.jsx'
import Topbar from './TopBar.jsx'


function DashboardLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor:
          'background.default',
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <Topbar />

        <Box
          sx={{
            p: {
              xs: 2,
              md: 4,
            },

            maxWidth: 1600,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default DashboardLayout
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Toolbar,
  Typography,
} from '@mui/material'

import {
  useLocation,
} from 'react-router-dom'


function Topbar() {
  const location = useLocation()

  const username =
    localStorage.getItem('username')

  const role =
    localStorage.getItem('role')

  const roleLabels = {
    ADMIN: 'Administrateur',
    AGENT: 'Agent',
    CLIENT: 'Client',
  }

  const getPageTitle = () => {
    if (
      location.pathname === '/dashboard'
    ) {
      return 'Tableau de bord'
    }

    if (
      location.pathname === '/admin'
    ) {
      return 'Administration'
    }

    if (
      location.pathname === '/new-ticket'
    ) {
      return 'Créer un ticket'
    }

    if (
      location.pathname === '/agent'
    ) {
      return 'Tickets assignés'
    }

    if (
      location.pathname.startsWith(
        '/tickets/'
      )
    ) {
      return 'Détail du ticket'
    }

    if (
      location.pathname === '/tickets'
    ) {
      return role === 'CLIENT'
        ? 'Mes tickets'
        : 'Tickets'
    }

    return 'TicketFlow'
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor:
          'rgba(20,27,45,0.92)',

        backdropFilter:
          'blur(12px)',

        borderBottom:
          '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',

          display: 'flex',
          justifyContent: 'space-between',

          px: {
            xs: 2,
            md: 4,
          },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            {getPageTitle()}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Application de Gestion de Tickets
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Chip
            label={
              roleLabels[role] || role
            }
            size="small"
            variant="outlined"
            color="secondary"
            sx={{
              display: {
                xs: 'none',
                sm: 'flex',
              },
            }}
          />

          <Box
            sx={{
              textAlign: 'right',

              display: {
                xs: 'none',
                md: 'block',
              },
            }}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
            >
              {username}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Connecté
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontWeight: 'bold',
            }}
          >
            {username
              ? username
                  .charAt(0)
                  .toUpperCase()
              : '?'}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
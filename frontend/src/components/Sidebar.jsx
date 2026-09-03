import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import DashboardIcon from '@mui/icons-material/Dashboard'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LogoutIcon from '@mui/icons-material/Logout'
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'


const drawerWidth = 260


function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')

  const roleLabels = {
    ADMIN: 'Administrateur',
    AGENT: 'Agent',
    CLIENT: 'Client',
  }

  const menuItems = []

  if (role === 'ADMIN') {
    menuItems.push(
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
      {
        text: 'Tous les tickets',
        icon: <ConfirmationNumberIcon />,
        path: '/tickets',
      },
      {
        text: 'Administration',
        icon: <AdminPanelSettingsIcon />,
        path: '/admin',
      }
    )
  }

  if (role === 'CLIENT') {
    menuItems.push(
      {
        text: 'Mes tickets',
        icon: <ConfirmationNumberIcon />,
        path: '/tickets',
      },
      {
        text: 'Nouveau ticket',
        icon: <AddCircleOutlineIcon />,
        path: '/new-ticket',
      }
    )
  }

  if (role === 'AGENT') {
    menuItems.push({
      text: 'Tickets assignés',
      icon: <ConfirmationNumberIcon />,
      path: '/agent',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')

    navigate('/login')
  }

  const isSelected = (path) => {
    if (path === '/tickets') {
      return (
        location.pathname === '/tickets' ||
        location.pathname.startsWith('/tickets/')
      )
    }

    return location.pathname === path
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background:
            'linear-gradient(180deg, #1f2a40 0%, #172033 100%)',
          borderRight:
            '1px solid rgba(255,255,255,0.06)',
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ConfirmationNumberOutlinedIcon
            sx={{ color: 'white' }}
          />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            lineHeight={1.1}
          >
            TicketFlow
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Gestion des tickets
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor:
            'rgba(255,255,255,0.07)',
        }}
      />

      <Box
        sx={{
          mx: 2,
          mt: 2,
          mb: 2,
          p: 2,
          borderRadius: 3,
          backgroundColor:
            'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,
            bgcolor: 'secondary.main',
            fontWeight: 'bold',
          }}
        >
          {username
            ? username.charAt(0).toUpperCase()
            : '?'}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            fontWeight="bold"
            noWrap
          >
            {username || 'Utilisateur'}
          </Typography>

          <Typography
            variant="caption"
            color="secondary"
          >
            {roleLabels[role] || role}
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{
          px: 3,
          mt: 1,
          mb: 0.5,
          letterSpacing: 1.2,
        }}
      >
        Navigation
      </Typography>

      <List
        sx={{
          px: 1.5,
          flexGrow: 1,
        }}
      >
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isSelected(item.path)}
            onClick={() =>
              navigate(item.path)
            }
            sx={{
              mb: 0.7,
              borderRadius: 2.5,
              minHeight: 48,

              '&.Mui-selected': {
                backgroundColor:
                  'rgba(104,112,250,0.18)',
                color: 'primary.light',
              },

              '&.Mui-selected:hover': {
                backgroundColor:
                  'rgba(104,112,250,0.24)',
              },

              '&:hover': {
                backgroundColor:
                  'rgba(255,255,255,0.05)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 42,
                color: 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight:
                  isSelected(item.path)
                    ? 700
                    : 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box
        sx={{
          px: 1.5,
          pb: 2,
        }}
      >
        <Divider
          sx={{
            mb: 1.5,
            borderColor:
              'rgba(255,255,255,0.07)',
          }}
        />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5,
            color: 'error.light',

            '&:hover': {
              backgroundColor:
                'rgba(244,67,54,0.08)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 42,
              color: 'inherit',
            }}
          >
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Déconnexion"
          />
        </ListItemButton>
      </Box>
    </Drawer>
  )
}

export default Sidebar
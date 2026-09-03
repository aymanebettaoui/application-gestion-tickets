import {
  Box,
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

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'


const drawerWidth = 240


function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')

  const menuItems = []

  if (role === 'ADMIN') {
    menuItems.push(
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
      {
        text: 'Tickets',
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
    menuItems.push(
      {
        text: 'Mes tickets assignés',
        icon: <ConfirmationNumberIcon />,
        path: '/agent',
      }
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')

    navigate('/login')
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
          backgroundColor: '#1f2a40',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
        >
          TICKET APP
        </Typography>

        <Typography
          variant="body2"
          color="secondary"
        >
          Gestion des tickets
        </Typography>

        {username && (
          <Typography
            variant="body2"
            sx={{ mt: 2 }}
          >
            {username}
          </Typography>
        )}

        {role && (
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {role}
          </Typography>
        )}
      </Box>

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={
              location.pathname === item.path
            }
            onClick={() =>
              navigate(item.path)
            }
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
            />
          </ListItemButton>
        ))}

        <ListItemButton
          onClick={handleLogout}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Déconnexion"
          />
        </ListItemButton>
      </List>
    </Drawer>
  )
}

export default Sidebar
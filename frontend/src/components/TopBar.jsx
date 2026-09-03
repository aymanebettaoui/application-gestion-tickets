import {
  AppBar,
  Box,
  IconButton,
  InputBase,
  Toolbar,
} from '@mui/material'

import SearchIcon from '@mui/icons-material/Search'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'

function Topbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#141b2d',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            backgroundColor: '#1f2a40',
            borderRadius: 1,
            px: 1,
          }}
        >
          <InputBase
            placeholder="Rechercher..."
            sx={{ ml: 1 }}
          />

          <IconButton>
            <SearchIcon />
          </IconButton>
        </Box>

        <Box>
          <IconButton>
            <NotificationsOutlinedIcon />
          </IconButton>

          <IconButton>
            <PersonOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
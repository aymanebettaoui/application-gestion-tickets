import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import ConfirmationNumberOutlinedIcon
  from '@mui/icons-material/ConfirmationNumberOutlined'
import LoginIcon from '@mui/icons-material/Login'


function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/token/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            username,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          "Nom d'utilisateur ou mot de passe incorrect."
        )
        return
      }

      localStorage.setItem(
        'token',
        data.token
      )

      const userResponse = await fetch(
        'http://127.0.0.1:8000/api/me/',
        {
          headers: {
            Authorization: `Token ${data.token}`,
          },
        }
      )

      if (!userResponse.ok) {
        localStorage.removeItem('token')

        setError(
          'Impossible de récupérer le profil utilisateur.'
        )

        return
      }

      const user = await userResponse.json()

      localStorage.setItem(
        'role',
        user.role
      )

      localStorage.setItem(
        'username',
        user.username
      )

      if (user.role === 'ADMIN') {
        navigate('/dashboard')
      } else if (user.role === 'AGENT') {
        navigate('/agent')
      } else {
        navigate('/tickets')
      }
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        px: 2,

        background:
          'radial-gradient(circle at top, #26375b 0%, #141b2d 45%, #0d1220 100%)',
      }}
    >

      <Paper
        elevation={12}
        sx={{
          width: '100%',
          maxWidth: 430,

          px: {
            xs: 3,
            sm: 5,
          },

          py: 5,

          borderRadius: 4,

          backgroundColor: '#1f2a40',

          border:
            '1px solid rgba(255,255,255,0.08)',
        }}
      >

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,

              borderRadius: 3,

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              backgroundColor: 'primary.main',
            }}
          >
            <ConfirmationNumberOutlinedIcon
              sx={{
                fontSize: 42,
                color: 'white',
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={1}
        >
          TicketFlow
        </Typography>

       

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
        >

          <TextField
            fullWidth
            label="Nom d'utilisateur"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            required
            autoFocus
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={
              loading
                ? null
                : <LoginIcon />
            }
            sx={{
              py: 1.4,
              fontWeight: 'bold',
              borderRadius: 2,
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                color="inherit"
              />
            ) : (
              'Se connecter'
            )}
          </Button>

        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          mt={4}
        >
          Application de Gestion de Tickets
        </Typography>

      </Paper>

    </Box>
  )
}


export default LoginPage
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'

function CreateTicketPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/categories/',
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        )

        if (response.ok) {
          const data = await response.json()

          setCategories(
            Array.isArray(data)
              ? data
              : data.results || []
          )
        }
      } catch {
        console.log('Erreur lors du chargement des catégories')
      }
    }

    loadCategories()
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/tickets/',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },

          body: JSON.stringify({
            title,
            description,
            priority,
            category: category ? Number(category) : null,
          }),
        }
      )

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        console.log(data)

        setError('Impossible de créer le ticket.')
        return
      }

      navigate('/tickets')
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxWidth="700px">
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={1}
      >
        NOUVEAU TICKET
      </Typography>

      <Typography
        color="secondary"
        mb={4}
      >
        Créer une nouvelle demande
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
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <TextField
          label="Titre"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          required
          multiline
          rows={5}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Priorité</InputLabel>

          <Select
            value={priority}
            label="Priorité"
            onChange={(event) =>
              setPriority(event.target.value)
            }
          >
            <MenuItem value="LOW">
              Basse
            </MenuItem>

            <MenuItem value="MEDIUM">
              Moyenne
            </MenuItem>

            <MenuItem value="HIGH">
              Haute
            </MenuItem>

            <MenuItem value="URGENT">
              Urgente
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Catégorie</InputLabel>

          <Select
            value={category}
            label="Catégorie"
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <MenuItem value="">
              Aucune
            </MenuItem>

            {categories.map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
              >
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading
              ? 'Création...'
              : 'Créer le ticket'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/tickets')}
          >
            Annuler
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateTicketPage
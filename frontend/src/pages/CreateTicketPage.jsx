import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackIcon
  from '@mui/icons-material/ArrowBack'
import SendOutlinedIcon
  from '@mui/icons-material/SendOutlined'


function CreateTicketPage() {
  const navigate = useNavigate()

  const [title, setTitle] =
    useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [priority, setPriority] =
    useState('MEDIUM')

  const [category, setCategory] =
    useState('')

  const [
    categories,
    setCategories,
  ] = useState([])

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    const loadCategories =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          navigate('/login')
          return
        }

        try {
          const response =
            await fetch(
              'http://127.0.0.1:8000/api/categories/',
              {
                headers: {
                  Authorization:
                    `Token ${token}`,
                },
              }
            )

          if (response.ok) {
            const data =
              await response.json()

            setCategories(
              Array.isArray(data)
                ? data
                : data.results || []
            )
          }
        } catch {
          setError(
            'Impossible de charger les catégories.'
          )
        }
      }

    loadCategories()
  }, [navigate])

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      setError('')
      setLoading(true)

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response =
          await fetch(
            'http://127.0.0.1:8000/api/tickets/',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Token ${token}`,
              },

              body: JSON.stringify({
                title,
                description,
                priority,

                category:
                  category
                    ? Number(
                        category
                      )
                    : null,
              }),
            }
          )

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.clear()
          navigate('/login')
          return
        }

        if (!response.ok) {
          setError(
            'Impossible de créer le ticket.'
          )
          return
        }

        navigate('/tickets')
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
        maxWidth: 850,
        mx: 'auto',
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate('/tickets')
        }
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
        >
          Nouveau ticket
        </Typography>

        <Typography
          color="text.secondary"
          mt={0.7}
        >
          Décrivez votre problème afin
          qu'un agent puisse vous aider.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: 4,
          overflow: 'hidden',

          border:
            '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box
          sx={{
            px: {
              xs: 3,
              md: 4,
            },

            py: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
          >
            Informations du ticket
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Fournissez suffisamment de
            détails pour faciliter le
            traitement de votre demande.
          </Typography>
        </Box>

        <Divider />

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            px: {
              xs: 3,
              md: 4,
            },

            py: 4,

            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <TextField
            label="Titre du problème"
            placeholder="Ex : Impossible de me connecter"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            required
            fullWidth
          />

          <TextField
            label="Description"
            placeholder="Expliquez le problème rencontré..."
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            required
            multiline
            rows={6}
            fullWidth
          />

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },

              gap: 3,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>
                Priorité
              </InputLabel>

              <Select
                value={priority}
                label="Priorité"
                onChange={(event) =>
                  setPriority(
                    event.target.value
                  )
                }
              >
                <MenuItem value="LOW">
                  Faible
                </MenuItem>

                <MenuItem value="MEDIUM">
                  Moyenne
                </MenuItem>

                <MenuItem value="HIGH">
                  Élevée
                </MenuItem>

                <MenuItem value="URGENT">
                  Urgente
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>
                Catégorie
              </InputLabel>

              <Select
                value={category}
                label="Catégorie"
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  Aucune
                </MenuItem>

                {categories.map(
                  (item) => (
                    <MenuItem
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          <Alert
            severity="info"
            variant="outlined"
          >
            Après création, votre ticket
            sera envoyé à l'administration
            pour être affecté à un agent.
          </Alert>

          <Box
            sx={{
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: 2,
              flexWrap: 'wrap',
              mt: 1,
            }}
          >
            <Button
              variant="outlined"
              size="large"
              disabled={loading}
              onClick={() =>
                navigate('/tickets')
              }
            >
              Annuler
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={
                loading
                  ? null
                  : <SendOutlinedIcon />
              }
              disabled={loading}
              sx={{
                minWidth: 170,
              }}
            >
              {loading ? (
                <CircularProgress
                  size={23}
                  color="inherit"
                />
              ) : (
                'Créer le ticket'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default CreateTicketPage
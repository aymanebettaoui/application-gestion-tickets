import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material'

import ConfirmationNumberOutlinedIcon
  from '@mui/icons-material/ConfirmationNumberOutlined'
import PendingActionsOutlinedIcon
  from '@mui/icons-material/PendingActionsOutlined'
import AutorenewOutlinedIcon
  from '@mui/icons-material/AutorenewOutlined'
import CheckCircleOutlineOutlinedIcon
  from '@mui/icons-material/CheckCircleOutlineOutlined'


function DashboardPage() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTickets = async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/tickets/',
          {
            headers: {
              Authorization:
                `Token ${token}`,
            },
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
            'Impossible de charger les données.'
          )
          return
        }

        const data =
          await response.json()

        setTickets(
          Array.isArray(data)
            ? data
            : data.results || []
        )
      } catch {
        setError(
          'Impossible de contacter le serveur.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [navigate])

  const stats = useMemo(() => {
    return {
      total: tickets.length,

      open: tickets.filter(
        (ticket) =>
          ticket.status === 'OPEN'
      ).length,

      progress: tickets.filter(
        (ticket) =>
          ticket.status === 'IN_PROGRESS'
      ).length,

      resolved: tickets.filter(
        (ticket) =>
          ticket.status === 'RESOLVED' ||
          ticket.status === 'CLOSED'
      ).length,
    }
  }, [tickets])

  const cards = [
    {
      title: 'Total des tickets',
      value: stats.total,
      icon: (
        <ConfirmationNumberOutlinedIcon />
      ),
      subtitle:
        'Tous les tickets enregistrés',
    },

    {
      title: 'Tickets ouverts',
      value: stats.open,
      icon: (
        <PendingActionsOutlinedIcon />
      ),
      subtitle:
        'En attente de traitement',
    },

    {
      title: 'En cours',
      value: stats.progress,
      icon: (
        <AutorenewOutlinedIcon />
      ),
      subtitle:
        'Actuellement traités',
    },

    {
      title: 'Résolus',
      value: stats.resolved,
      icon: (
        <CheckCircleOutlineOutlinedIcon />
      ),
      subtitle:
        'Résolus ou fermés',
    },
  ]

  const statusLabels = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Résolu',
    CLOSED: 'Fermé',
    CANCELLED: 'Annulé',
  }

  const statusColors = {
    OPEN: 'info',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success',
    CLOSED: 'success',
    CANCELLED: 'error',
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
        >
          Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          mt={0.7}
        >
          Vue générale de l'activité des tickets
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

      <Grid
        container
        spacing={2.5}
      >
        {cards.map((card) => (
          <Grid
            key={card.title}
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border:
                  '1px solid rgba(255,255,255,0.06)',
                background:
                  'linear-gradient(145deg, #1f2a40 0%, #1a2438 100%)',
              }}
            >
              <CardContent
                sx={{ p: 3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent:
                      'space-between',
                  }}
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      mt={1}
                    >
                      {card.value}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      color: 'primary.light',
                      backgroundColor:
                        'rgba(104,112,250,0.13)',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={2}
                >
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          border:
            '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Tickets récents
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Dernières demandes enregistrées
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="primary.light"
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() =>
              navigate('/tickets')
            }
          >
            Voir tous les tickets
          </Typography>
        </Box>

        {tickets.length === 0 ? (
          <Typography
            color="text.secondary"
            py={4}
            textAlign="center"
          >
            Aucun ticket disponible.
          </Typography>
        ) : (
          tickets
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
            )
            .slice(0, 5)
            .map((ticket) => (
              <Box
                key={ticket.id}
                onClick={() =>
                  navigate(
                    `/tickets/${ticket.id}`
                  )
                }
                sx={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  px: 1.5,
                  borderTop:
                    '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  borderRadius: 2,

                  '&:hover': {
                    backgroundColor:
                      'rgba(255,255,255,0.03)',
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <Typography
                    fontWeight="bold"
                    noWrap
                  >
                    #{ticket.id} ·{' '}
                    {ticket.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    mt={0.4}
                  >
                    {ticket.description}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={
                    statusLabels[
                      ticket.status
                    ] || ticket.status
                  }
                  color={
                    statusColors[
                      ticket.status
                    ] || 'default'
                  }
                />
              </Box>
            ))
        )}
      </Paper>
    </Box>
  )
}

export default DashboardPage
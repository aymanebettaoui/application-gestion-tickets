import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material'

function DashboardPage() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTickets = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/tickets/',
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        )

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }

        if (!response.ok) {
          setError('Impossible de charger les données.')
          return
        }

        const data = await response.json()

        setTickets(
          Array.isArray(data)
            ? data
            : data.results || []
        )
      } catch {
        setError('Impossible de contacter le serveur.')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [navigate])

  const getStatus = (ticket) =>
    String(ticket.status || ticket.statut || '').toUpperCase()

  const totalTickets = tickets.length

  const openTickets = tickets.filter((ticket) => {
    const status = getStatus(ticket)

    return (
      status === 'OPEN' ||
      status === 'OUVERT' ||
      status === 'TODO' ||
      status === 'À FAIRE'
    )
  }).length

  const inProgressTickets = tickets.filter((ticket) => {
    const status = getStatus(ticket)

    return (
      status === 'IN_PROGRESS' ||
      status === 'IN PROGRESS' ||
      status === 'EN COURS' ||
      status === 'ASSIGNED' ||
      status === 'AFFECTÉ'
    )
  }).length

  const resolvedTickets = tickets.filter((ticket) => {
    const status = getStatus(ticket)

    return (
      status === 'RESOLVED' ||
      status === 'RÉSOLU' ||
      status === 'RESOLU' ||
      status === 'CLOSED' ||
      status === 'FERMÉ' ||
      status === 'FERME'
    )
  }).length

  const cards = [
    {
      title: 'Total Tickets',
      value: totalTickets,
    },
    {
      title: 'Tickets ouverts',
      value: openTickets,
    },
    {
      title: 'En cours',
      value: inProgressTickets,
    },
    {
      title: 'Résolus',
      value: resolvedTickets,
    },
  ]

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
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={1}
      >
        DASHBOARD
      </Typography>

      <Typography
        color="secondary"
        mb={4}
      >
        Vue générale de la gestion des tickets
      </Typography>

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
        spacing={2}
      >
        {cards.map((card) => (
          <Grid
            key={card.title}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  {card.title}
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight="bold"
                  mt={1}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={5}>
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={2}
        >
          Tickets récents
        </Typography>

        {tickets.slice(0, 5).map((ticket) => (
          <Card
            key={ticket.id}
            sx={{ mb: 1 }}
          >
            <CardContent
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography>
                {ticket.title ||
                  ticket.titre ||
                  `Ticket #${ticket.id}`}
              </Typography>

              <Typography color="secondary">
                {ticket.status ||
                  ticket.statut ||
                  'Non défini'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default DashboardPage
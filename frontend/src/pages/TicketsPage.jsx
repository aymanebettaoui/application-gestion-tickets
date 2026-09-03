import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  Typography,
  Alert,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import { DataGrid } from '@mui/x-data-grid'

function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

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
          setError('Impossible de charger les tickets.')
          return
        }

        const data = await response.json()

        const rawTickets = Array.isArray(data)
          ? data
          : data.results || []

        const formattedTickets = rawTickets.map((ticket) => ({
          id: ticket.id,
          title:
            ticket.title ||
            ticket.titre ||
            `Ticket #${ticket.id}`,
          status:
            ticket.status ||
            ticket.statut ||
            'Non défini',
          priority:
            ticket.priority ||
            ticket.priorite ||
            'Non définie',
          description:
            ticket.description ||
            '',
        }))

        setTickets(formattedTickets)
      } catch {
        setError('Impossible de contacter le serveur.')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [navigate])

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'title',
      headerName: 'Titre',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 150,
    },
    {
      field: 'priority',
      headerName: 'Priorité',
      width: 150,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 250,
    },
  ]

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
          >
            TICKETS
          </Typography>

          <Typography color="secondary">
            Liste des tickets
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/new-ticket')}
        >
          Nouveau ticket
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          height: 550,
          width: '100%',
        }}
      >
        <DataGrid
          rows={tickets}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  )
}

export default TicketsPage
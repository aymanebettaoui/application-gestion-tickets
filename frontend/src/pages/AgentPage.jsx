import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/material'

import { DataGrid } from '@mui/x-data-grid'


function AgentPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const getToken = () => localStorage.getItem('token')

  const loadTickets = async () => {
    const token = getToken()

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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.clear()
        navigate('/login')
        return
      }

      if (!response.ok) {
        setError('Impossible de charger les tickets.')
        return
      }

      const data = await response.json()

      const ticketList = Array.isArray(data)
        ? data
        : data.results || []

      setTickets(ticketList)
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const role = localStorage.getItem('role')

    if (role !== 'AGENT') {
      navigate('/login')
      return
    }

    loadTickets()
  }, [navigate])

  const handleStatusChange = async (ticket) => {
    let newStatus = null

    if (ticket.status === 'OPEN') {
      newStatus = 'IN_PROGRESS'
    }

    if (ticket.status === 'IN_PROGRESS') {
      newStatus = 'RESOLVED'
    }

    if (!newStatus) {
      return
    }

    const token = getToken()

    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticket.id}/update_status/`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        console.log(data)

        setError(
          'Impossible de modifier le statut du ticket.'
        )
        return
      }

      await loadTickets()
    } catch {
      setError('Impossible de contacter le serveur.')
    }
  }

  const getStatusLabel = (status) => {
    if (status === 'OPEN') {
      return 'Ouvert'
    }

    if (status === 'IN_PROGRESS') {
      return 'En cours'
    }

    if (status === 'RESOLVED') {
      return 'Résolu'
    }

    if (status === 'CLOSED') {
      return 'Fermé'
    }

    if (status === 'CANCELLED') {
      return 'Annulé'
    }

    return status
  }

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
    },

    {
      field: 'title',
      headerName: 'Titre',
      flex: 1,
      minWidth: 180,
    },

    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 220,
    },

    {
      field: 'priority',
      headerName: 'Priorité',
      width: 130,

      renderCell: (params) => (
        <Chip
          label={params.row.priority}
          size="small"
        />
      ),
    },

    {
      field: 'status',
      headerName: 'Statut',
      width: 140,

      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.row.status)}
          size="small"
          color={
            params.row.status === 'RESOLVED'
              ? 'success'
              : params.row.status === 'IN_PROGRESS'
              ? 'warning'
              : 'default'
          }
        />
      ),
    },

    {
      field: 'action',
      headerName: 'Action',
      width: 180,
      sortable: false,
      filterable: false,

      renderCell: (params) => {
        if (params.row.status === 'OPEN') {
          return (
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleStatusChange(params.row)
              }
            >
              Commencer
            </Button>
          )
        }

        if (params.row.status === 'IN_PROGRESS') {
          return (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() =>
                handleStatusChange(params.row)
              }
            >
              Résoudre
            </Button>
          )
        }

        return (
          <Typography variant="body2">
            Aucune action
          </Typography>
        )
      },
    },
  ]

  return (
    <Box>
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={1}
      >
        MES TICKETS ASSIGNÉS
      </Typography>

      <Typography
        color="secondary"
        mb={3}
      >
        Traitement des tickets qui me sont affectés
      </Typography>

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
          height: 600,
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

export default AgentPage
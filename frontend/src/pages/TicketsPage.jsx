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
  Chip,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import ChatIcon from '@mui/icons-material/Chat'

import {
  DataGrid,
} from '@mui/x-data-grid'


function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const role = localStorage.getItem('role')

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
          'Impossible de charger les tickets.'
        )
        return
      }

      const data = await response.json()

      const rawTickets = Array.isArray(data)
        ? data
        : data.results || []

      setTickets(rawTickets)
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [navigate])

  const handleCancel = async (ticketId) => {
    const token = localStorage.getItem('token')

    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticketId}/cancel/`,
        {
          method: 'POST',

          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()

        console.log(data)

        setError(
          "Impossible d'annuler ce ticket."
        )

        return
      }

      await loadTickets()
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      OPEN: 'Ouvert',
      IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu',
      CLOSED: 'Fermé',
      CANCELLED: 'Annulé',
    }

    return labels[status] || status
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      LOW: 'Faible',
      MEDIUM: 'Moyenne',
      HIGH: 'Élevée',
      URGENT: 'Urgente',
    }

    return labels[priority] || priority
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
          size="small"
          label={
            getPriorityLabel(
              params.row.priority
            )
          }
        />
      ),
    },

    {
      field: 'status',
      headerName: 'Statut',
      width: 140,

      renderCell: (params) => (
        <Chip
          size="small"
          label={
            getStatusLabel(
              params.row.status
            )
          }
          color={
            params.row.status === 'RESOLVED'
              ? 'success'
              : params.row.status === 'IN_PROGRESS'
              ? 'warning'
              : params.row.status === 'CANCELLED'
              ? 'error'
              : params.row.status === 'CLOSED'
              ? 'success'
              : 'default'
          }
        />
      ),
    },
  ]

  if (role === 'CLIENT') {
    columns.push({
      field: 'conversation',
      headerName: 'Discussion',
      width: 150,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={() =>
            navigate(
              `/tickets/${params.row.id}`
            )
          }
        >
          Ouvrir
        </Button>
      ),
    })

    columns.push({
      field: 'action',
      headerName: 'Action',
      width: 150,
      sortable: false,
      filterable: false,

      renderCell: (params) => {
        if (params.row.status !== 'OPEN') {
          return (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              —
            </Typography>
          )
        }

        return (
          <Button
            size="small"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() =>
              handleCancel(
                params.row.id
              )
            }
          >
            Annuler
          </Button>
        )
      },
    })
  }

  if (role === 'ADMIN') {
    columns.push({
      field: 'conversation',
      headerName: 'Discussion',
      width: 150,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ChatIcon />}
          onClick={() =>
            navigate(
              `/tickets/${params.row.id}`
            )
          }
        >
          Voir
        </Button>
      ),
    })
  }

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
            {role === 'CLIENT'
              ? 'MES TICKETS'
              : 'TICKETS'}
          </Typography>

          <Typography
            color="secondary"
          >
            {role === 'CLIENT'
              ? 'Suivi de mes demandes'
              : 'Liste des tickets'}
          </Typography>
        </Box>

        {role === 'CLIENT' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate('/new-ticket')
            }
          >
            Nouveau ticket
          </Button>
        )}

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
          height: 600,
          width: '100%',
        }}
      >
        <DataGrid
          rows={tickets}
          columns={columns}
          loading={loading}
          pageSizeOptions={[
            5,
            10,
            20,
          ]}
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
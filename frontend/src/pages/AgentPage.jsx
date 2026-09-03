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

import ChatIcon from '@mui/icons-material/Chat'

import {
  DataGrid,
} from '@mui/x-data-grid'


function AgentPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()

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
          'Impossible de charger les tickets.'
        )
        return
      }

      const data = await response.json()

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

  useEffect(() => {
    if (
      localStorage.getItem('role')
      !== 'AGENT'
    ) {
      navigate('/login')
      return
    }

    loadTickets()
  }, [navigate])

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
      width: 150,

      renderCell: (params) => (
        <Chip
          label={
            getStatusLabel(
              params.row.status
            )
          }
          size="small"
          color={
            params.row.status ===
            'RESOLVED'
              ? 'success'
              : params.row.status ===
                'IN_PROGRESS'
              ? 'warning'
              : 'default'
          }
        />
      ),
    },

    {
      field: 'action',
      headerName: 'Conversation',
      width: 160,
      sortable: false,

      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
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
        Échangez avec les clients pour
        résoudre leurs demandes
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
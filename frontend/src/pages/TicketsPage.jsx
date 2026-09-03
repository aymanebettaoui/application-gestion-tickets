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
  Button,
  Chip,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import ChatIcon from '@mui/icons-material/Chat'
import SearchIcon from '@mui/icons-material/Search'

import {
  DataGrid,
} from '@mui/x-data-grid'


function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const navigate = useNavigate()

  const role =
    localStorage.getItem('role')

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

  useEffect(() => {
    loadTickets()
  }, [navigate])

  const handleCancel = async (
    ticketId
  ) => {
    const token =
      localStorage.getItem('token')

    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticketId}/cancel/`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
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

  const statusLabels = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Résolu',
    CLOSED: 'Fermé',
    CANCELLED: 'Annulé',
  }

  const priorityLabels = {
    LOW: 'Faible',
    MEDIUM: 'Moyenne',
    HIGH: 'Élevée',
    URGENT: 'Urgente',
  }

  const statusColors = {
    OPEN: 'info',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success',
    CLOSED: 'success',
    CANCELLED: 'error',
  }

  const priorityColors = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error',
  }

  const filteredTickets =
    useMemo(() => {
      const value =
        search.trim().toLowerCase()

      if (!value) {
        return tickets
      }

      return tickets.filter(
        (ticket) =>
          ticket.title
            ?.toLowerCase()
            .includes(value) ||
          ticket.description
            ?.toLowerCase()
            .includes(value) ||
          String(ticket.id).includes(
            value
          ) ||
          statusLabels[
            ticket.status
          ]
            ?.toLowerCase()
            .includes(value)
      )
    }, [tickets, search])

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 75,
    },

    {
      field: 'title',
      headerName: 'Titre',
      flex: 1,
      minWidth: 190,

      renderCell: (params) => (
        <Typography
          fontWeight={600}
          variant="body2"
        >
          {params.row.title}
        </Typography>
      ),
    },

    {
      field: 'description',
      headerName: 'Description',
      flex: 1.4,
      minWidth: 240,
    },

    {
      field: 'priority',
      headerName: 'Priorité',
      width: 125,

      renderCell: (params) => (
        <Chip
          size="small"
          variant="outlined"
          label={
            priorityLabels[
              params.row.priority
            ] ||
            params.row.priority
          }
          color={
            priorityColors[
              params.row.priority
            ] || 'default'
          }
        />
      ),
    },

    {
      field: 'status',
      headerName: 'Statut',
      width: 135,

      renderCell: (params) => (
        <Chip
          size="small"
          label={
            statusLabels[
              params.row.status
            ] ||
            params.row.status
          }
          color={
            statusColors[
              params.row.status
            ] || 'default'
          }
        />
      ),
    },
  ]

  if (
    role === 'CLIENT' ||
    role === 'ADMIN'
  ) {
    columns.push({
      field: 'conversation',
      headerName: 'Discussion',
      width: 145,
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
          {role === 'ADMIN'
            ? 'Voir'
            : 'Ouvrir'}
        </Button>
      ),
    })
  }

  if (role === 'CLIENT') {
    columns.push({
      field: 'action',
      headerName: 'Action',
      width: 140,
      sortable: false,
      filterable: false,

      renderCell: (params) => {
        if (
          params.row.status !== 'OPEN'
        ) {
          return (
            <Typography
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

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight="bold"
          >
            {role === 'CLIENT'
              ? 'Mes tickets'
              : 'Tickets'}
          </Typography>

          <Typography
            color="text.secondary"
            mt={0.6}
          >
            {role === 'CLIENT'
              ? 'Suivez vos demandes et échangez avec le support'
              : 'Consultez et suivez les tickets enregistrés'}
          </Typography>
        </Box>

        {role === 'CLIENT' && (
          <Button
            variant="contained"
            size="large"
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

      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border:
            '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: 2,
            borderBottom:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            fontWeight="bold"
          >
            {filteredTickets.length}{' '}
            ticket
            {filteredTickets.length !== 1
              ? 's'
              : ''}
          </Typography>

          <TextField
            size="small"
            placeholder="Rechercher..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            sx={{
              width: {
                xs: '100%',
                sm: 300,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                >
                  <SearchIcon
                    fontSize="small"
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box
          sx={{
            height: 610,
            width: '100%',
          }}
        >
          <DataGrid
            rows={filteredTickets}
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
            sx={{
              border: 0,

              '& .MuiDataGrid-columnHeaders':
                {
                  backgroundColor:
                    'rgba(255,255,255,0.025)',
                },

              '& .MuiDataGrid-row:hover':
                {
                  backgroundColor:
                    'rgba(104,112,250,0.04)',
                },
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}

export default TicketsPage
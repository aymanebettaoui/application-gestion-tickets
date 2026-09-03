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

import ChatOutlinedIcon
  from '@mui/icons-material/ChatOutlined'
import SearchIcon
  from '@mui/icons-material/Search'

import {
  DataGrid,
} from '@mui/x-data-grid'


function AgentPage() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

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
    if (
      localStorage.getItem('role')
      !== 'AGENT'
    ) {
      navigate('/login')
      return
    }

    loadTickets()
  }, [navigate])

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

          String(ticket.id)
            .includes(value) ||

          statusLabels[
            ticket.status
          ]
            ?.toLowerCase()
            .includes(value)
      )
    }, [tickets, search])

  const openCount =
    tickets.filter(
      (ticket) =>
        ticket.status === 'OPEN'
    ).length

  const progressCount =
    tickets.filter(
      (ticket) =>
        ticket.status === 'IN_PROGRESS'
    ).length

  const resolvedCount =
    tickets.filter(
      (ticket) =>
        ticket.status === 'RESOLVED'
    ).length

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
          variant="body2"
          fontWeight={600}
        >
          {params.row.title}
        </Typography>
      ),
    },

    {
      field: 'description',
      headerName: 'Description',
      flex: 1.4,
      minWidth: 250,
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

    {
      field: 'action',
      headerName: 'Conversation',
      width: 160,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={
            <ChatOutlinedIcon />
          }
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
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
        >
          Tickets assignés
        </Typography>

        <Typography
          color="text.secondary"
          mt={0.7}
        >
          Échangez avec les clients et
          traitez les demandes qui vous
          sont affectées.
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

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Paper
          sx={{
            p: 2.5,
            minWidth: 170,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Assignés
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
          >
            {tickets.length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            minWidth: 170,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            À commencer
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="info.main"
          >
            {openCount}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            minWidth: 170,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            En cours
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="warning.main"
          >
            {progressCount}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2.5,
            minWidth: 170,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            En attente client
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="success.main"
          >
            {resolvedCount}
          </Typography>
        </Paper>
      </Box>

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
          <Typography fontWeight="bold">
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

export default AgentPage
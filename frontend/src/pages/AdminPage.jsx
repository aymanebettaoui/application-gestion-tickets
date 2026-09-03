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
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'

import SearchIcon from '@mui/icons-material/Search'
import AssignmentIndOutlinedIcon
  from '@mui/icons-material/AssignmentIndOutlined'

import {
  DataGrid,
} from '@mui/x-data-grid'


function AdminPage() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const getToken = () =>
    localStorage.getItem('token')

  const loadData = async () => {
    const token = getToken()

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const [
        ticketsResponse,
        agentsResponse,
      ] = await Promise.all([
        fetch(
          'http://127.0.0.1:8000/api/tickets/',
          {
            headers: {
              Authorization:
                `Token ${token}`,
            },
          }
        ),

        fetch(
          'http://127.0.0.1:8000/api/users/',
          {
            headers: {
              Authorization:
                `Token ${token}`,
            },
          }
        ),
      ])

      if (
        ticketsResponse.status === 401 ||
        ticketsResponse.status === 403
      ) {
        localStorage.clear()
        navigate('/login')
        return
      }

      if (!ticketsResponse.ok) {
        setError(
          'Impossible de charger les tickets.'
        )
        return
      }

      const ticketsData =
        await ticketsResponse.json()

      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
          : ticketsData.results || []
      )

      if (agentsResponse.ok) {
        const agentsData =
          await agentsResponse.json()

        setAgents(
          Array.isArray(agentsData)
            ? agentsData
            : agentsData.results || []
        )
      }
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (
    ticketId,
    agentId
  ) => {
    const token = getToken()

    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticketId}/assign/`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Token ${token}`,
          },

          body: JSON.stringify({
            assigned_to:
              agentId || null,
          }),
        }
      )

      if (!response.ok) {
        setError(
          "Impossible d'affecter le ticket."
        )
        return
      }

      await loadData()
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

          String(ticket.id)
            .includes(value) ||

          statusLabels[
            ticket.status
          ]
            ?.toLowerCase()
            .includes(value)
      )
    }, [tickets, search])

  const assignedCount =
    tickets.filter(
      (ticket) =>
        ticket.assigned_to !== null
    ).length

  const unassignedCount =
    tickets.length - assignedCount

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
      minWidth: 200,

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
      field: 'priority',
      headerName: 'Priorité',
      width: 130,

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
      width: 140,

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
      field: 'assigned_to',
      headerName: 'Affectation',
      width: 230,
      sortable: false,

      renderCell: (params) => (
        <Select
          size="small"
          value={
            params.row.assigned_to || ''
          }
          displayEmpty
          onClick={(event) =>
            event.stopPropagation()
          }
          onChange={(event) =>
            handleAssign(
              params.row.id,
              event.target.value
            )
          }
          sx={{
            width: 200,
            borderRadius: 2,
          }}
        >
          <MenuItem value="">
            Non assigné
          </MenuItem>

          {agents.map((agent) => (
            <MenuItem
              key={agent.id}
              value={agent.id}
            >
              {agent.username}
            </MenuItem>
          ))}
        </Select>
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
          Administration
        </Typography>

        <Typography
          color="text.secondary"
          mt={0.7}
        >
          Affectez les tickets aux agents
          disponibles
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
            px: 3,
            py: 2,
            minWidth: 180,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Total
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
            px: 3,
            py: 2,
            minWidth: 180,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Affectés
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="secondary"
          >
            {assignedCount}
          </Typography>
        </Paper>

        <Paper
          sx={{
            px: 3,
            py: 2,
            minWidth: 180,
            borderRadius: 3,
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Non affectés
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            color="warning.main"
          >
            {unassignedCount}
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
            alignItems: 'center',
            justifyContent:
              'space-between',

            gap: 2,

            borderBottom:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AssignmentIndOutlinedIcon
              color="primary"
            />

            <Typography
              fontWeight="bold"
            >
              Affectation des tickets
            </Typography>
          </Box>

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

export default AdminPage
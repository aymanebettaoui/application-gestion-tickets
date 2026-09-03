import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Chip,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'

import { DataGrid } from '@mui/x-data-grid'

function AdminPage() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const getToken = () => localStorage.getItem('token')

  const loadData = async () => {
    const token = getToken()

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const [ticketsResponse, agentsResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/tickets/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        }),

        fetch('http://127.0.0.1:8000/api/users/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        }),
      ])

      if (
        ticketsResponse.status === 401 ||
        ticketsResponse.status === 403
      ) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      if (!ticketsResponse.ok) {
        setError('Impossible de charger les tickets.')
        return
      }

      const ticketsData = await ticketsResponse.json()

      setTickets(
        Array.isArray(ticketsData)
          ? ticketsData
          : ticketsData.results || []
      )

      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()

        setAgents(
          Array.isArray(agentsData)
            ? agentsData
            : agentsData.results || []
        )
      }
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (ticketId, agentId) => {
    const token = getToken()

    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticketId}/assign/`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },

          body: JSON.stringify({
            assigned_to: agentId || null,
          }),
        }
      )

      if (!response.ok) {
        setError("Impossible d'affecter le ticket.")
        return
      }

      await loadData()
    } catch {
      setError('Impossible de contacter le serveur.')
    }
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
      minWidth: 200,
    },

    {
      field: 'priority',
      headerName: 'Priorité',
      width: 140,

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
      width: 160,

      renderCell: (params) => (
        <Chip
          label={params.row.status}
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
      field: 'assigned_to',
      headerName: 'Affectation',
      width: 220,

      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.assigned_to || ''}
          displayEmpty
          onClick={(event) => event.stopPropagation()}
          onChange={(event) =>
            handleAssign(
              params.row.id,
              event.target.value
            )
          }
          sx={{ width: 190 }}
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
      <Typography
        variant="h3"
        fontWeight="bold"
        mb={1}
      >
        ADMINISTRATION
      </Typography>

      <Typography
        color="secondary"
        mb={3}
      >
        Affectation et suivi des tickets
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

export default AdminPage
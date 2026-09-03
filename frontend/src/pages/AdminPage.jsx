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
  const [users, setUsers] = useState([])
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
      const [ticketsResponse, usersResponse] = await Promise.all([
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

      if (ticketsResponse.status === 401 || ticketsResponse.status === 403) {
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

     const usersData = await usersResponse.json()

console.log('USERS STATUS:', usersResponse.status)
console.log('USERS DATA:', usersData)

if (usersResponse.ok) {
  setUsers(
    Array.isArray(usersData)
      ? usersData
      : usersData.results || []
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

  const handleStatusChange = async (ticketId, newStatus) => {
    const token = getToken()

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${ticketId}/`,
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
        setError('Impossible de modifier le statut.')
        return
      }

      await loadData()
    } catch {
      setError('Impossible de contacter le serveur.')
    }
  }

  const handleAssign = async (ticketId, userId) => {
    const token = getToken()

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
            assigned_to: userId || null,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        console.log(data)

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
      minWidth: 180,
      renderCell: (params) =>
        params.row.title ||
        params.row.titre ||
        `Ticket #${params.row.id}`,
    },

    {
      field: 'priority',
      headerName: 'Priorité',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.row.priority ||
            params.row.priorite ||
            'Non définie'
          }
        />
      ),
    },

    {
      field: 'status',
      headerName: 'Statut',
      width: 180,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.status || 'OPEN'}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) =>
            handleStatusChange(
              params.row.id,
              event.target.value
            )
          }
          sx={{ width: 150 }}
        >
          <MenuItem value="OPEN">Ouvert</MenuItem>
          <MenuItem value="IN_PROGRESS">En cours</MenuItem>
          <MenuItem value="RESOLVED">Résolu</MenuItem>
          <MenuItem value="CLOSED">Fermé</MenuItem>
        </Select>
      ),
    },

    {
      field: 'assigned_to',
      headerName: 'Affectation',
      width: 200,
      renderCell: (params) => (
        <Select
          size="small"
          value={
            params.row.assigned_to?.id ||
            params.row.assigned_to ||
            ''
          }
          displayEmpty
          onClick={(event) => event.stopPropagation()}
          onChange={(event) =>
            handleAssign(
              params.row.id,
              event.target.value
            )
          }
          sx={{ width: 170 }}
        >
          <MenuItem value="">
            Non assigné
          </MenuItem>

          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={user.id}
            >
              {user.username}
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
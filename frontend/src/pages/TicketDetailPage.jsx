import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ReplayIcon from '@mui/icons-material/Replay'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'


function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef = useRef(null)

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')

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

  const loadTicket = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        setError(
          "Vous n'avez pas accès à ce ticket."
        )
        return
      }

      if (!response.ok) {
        setError(
          'Impossible de charger le ticket.'
        )
        return
      }

      const data = await response.json()
      setTicket(data)
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/messages/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setMessages(
        Array.isArray(data)
          ? data
          : data.results || []
      )
    } catch {
      // Do nothing during automatic refresh
    }
  }

  const loadPage = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)

    await Promise.all([
      loadTicket(),
      loadMessages(),
    ])

    setLoading(false)
  }

  useEffect(() => {
    loadPage()

    const interval = setInterval(() => {
      loadMessages()
      loadTicket()
    }, 3000)

    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleSendMessage = async (event) => {
    event.preventDefault()

    const message = content.trim()

    if (!message) {
      return
    }

    setSending(true)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/messages/`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },

          body: JSON.stringify({
            content: message,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()

        setError(
          data.detail ||
          data.content ||
          "Impossible d'envoyer le message."
        )

        return
      }

      setContent('')

      await loadMessages()
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setSending(false)
    }
  }

  const updateAgentStatus = async (
    newStatus
  ) => {
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/update_status/`,
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

        setError(
          data.detail ||
          'Changement de statut impossible.'
        )

        return
      }

      await loadTicket()
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    }
  }

  const confirmResolution = async () => {
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/confirm_resolution/`,
        {
          method: 'PATCH',

          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()

        setError(
          data.detail ||
          'Confirmation impossible.'
        )

        return
      }

      await loadTicket()
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    }
  }

  const reopenTicket = async () => {
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/reopen/`,
        {
          method: 'PATCH',

          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()

        setError(
          data.detail ||
          'Réouverture impossible.'
        )

        return
      }

      await loadTicket()
    } catch {
      setError(
        'Impossible de contacter le serveur.'
      )
    }
  }

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

  if (!ticket) {
    return (
      <Box>
        <Alert severity="error">
          {error || 'Ticket introuvable.'}
        </Alert>
      </Box>
    )
  }

  const conversationDisabled = [
    'CLOSED',
    'CANCELLED',
  ].includes(ticket.status)

  return (
    <Box>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          if (role === 'AGENT') {
            navigate('/agent')
          } else {
            navigate('/tickets')
          }
        }}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Typography
        variant="h3"
        fontWeight="bold"
        mb={1}
      >
        TICKET #{ticket.id}
      </Typography>

      <Typography
        variant="h5"
        mb={3}
      >
        {ticket.title}
      </Typography>

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
          p: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={
              getStatusLabel(ticket.status)
            }
            color={
              ticket.status === 'RESOLVED'
                ? 'success'
                : ticket.status === 'IN_PROGRESS'
                ? 'warning'
                : 'default'
            }
          />

          <Chip
            label={
              `Priorité : ${getPriorityLabel(
                ticket.priority
              )}`
            }
            variant="outlined"
          />
        </Box>

        <Typography
          color="text.secondary"
          mb={1}
        >
          Description
        </Typography>

        <Typography>
          {ticket.description}
        </Typography>
      </Paper>

      {role === 'AGENT' &&
        ticket.status === 'OPEN' && (
          <Alert
            severity="info"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                startIcon={<PlayArrowIcon />}
                onClick={() =>
                  updateAgentStatus(
                    'IN_PROGRESS'
                  )
                }
              >
                Commencer
              </Button>
            }
          >
            Commencez le traitement avant
            de résoudre le ticket.
          </Alert>
        )}

      {role === 'AGENT' &&
        ticket.status === 'IN_PROGRESS' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 3,
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() =>
                updateAgentStatus('RESOLVED')
              }
            >
              Marquer comme résolu
            </Button>
          </Box>
        )}

      {role === 'AGENT' &&
        ticket.status === 'RESOLVED' && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Solution proposée. En attente de
            confirmation du client.
          </Alert>
        )}

      {role === 'CLIENT' &&
        ticket.status === 'RESOLVED' && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              mb={2}
            >
              Le problème est-il résolu ?
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                color="success"
                startIcon={
                  <CheckCircleIcon />
                }
                onClick={
                  confirmResolution
                }
              >
                Confirmer la résolution
              </Button>

              <Button
                variant="outlined"
                color="warning"
                startIcon={<ReplayIcon />}
                onClick={reopenTicket}
              >
                Problème persiste
              </Button>
            </Box>
          </Paper>
        )}

      {ticket.status === 'CLOSED' && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
        >
          Ce ticket a été confirmé comme
          résolu et fermé.
        </Alert>
      )}

      <Paper
        sx={{
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={2}
        >
          Conversation
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box
          sx={{
            height: 420,
            overflowY: 'auto',
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 2,
          }}
        >
          {messages.length === 0 && (
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 5 }}
            >
              Aucun message pour le moment.
            </Typography>
          )}

          {messages.map((message) => {
            const mine =
              message.sender_username ===
              username

            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: mine
                    ? 'flex-end'
                    : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: mine
                      ? 'primary.main'
                      : 'background.paper',
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    display="block"
                    mb={0.5}
                  >
                    {mine
                      ? 'Vous'
                      : message.sender_username}
                  </Typography>

                  <Typography
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.content}
                  </Typography>

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 1,
                      opacity: 0.7,
                    }}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleString()}
                  </Typography>
                </Paper>
              </Box>
            )
          })}

          <div ref={messagesEndRef} />
        </Box>

        {!conversationDisabled ? (
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              display: 'flex',
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Écrire un message..."
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
            />

            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={
                sending ||
                !content.trim()
              }
            >
              Envoyer
            </Button>
          </Box>
        ) : (
          <Alert
            severity="info"
            sx={{ mt: 2 }}
          >
            La conversation est terminée.
          </Alert>
        )}
      </Paper>
    </Box>
  )
}

export default TicketDetailPage
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
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import ArrowBackIcon
  from '@mui/icons-material/ArrowBack'
import SendIcon
  from '@mui/icons-material/Send'
import CheckCircleIcon
  from '@mui/icons-material/CheckCircle'
import ReplayIcon
  from '@mui/icons-material/Replay'
import PlayArrowIcon
  from '@mui/icons-material/PlayArrow'
import ForumOutlinedIcon
  from '@mui/icons-material/ForumOutlined'


function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] =
    useState(null)

  const [messages, setMessages] =
    useState([])

  const [content, setContent] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [error, setError] =
    useState('')

  const messagesEndRef =
    useRef(null)

  const token =
    localStorage.getItem('token')

  const role =
    localStorage.getItem('role')

  const username =
    localStorage.getItem('username')

  const statusLabels = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Résolu',
    CLOSED: 'Fermé',
    CANCELLED: 'Annulé',
  }

  const statusColors = {
    OPEN: 'info',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success',
    CLOSED: 'success',
    CANCELLED: 'error',
  }

  const priorityLabels = {
    LOW: 'Faible',
    MEDIUM: 'Moyenne',
    HIGH: 'Élevée',
    URGENT: 'Urgente',
  }

  const priorityColors = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error',
  }

  const loadTicket = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/tickets/${id}/`,
        {
          headers: {
            Authorization:
              `Token ${token}`,
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

      const data =
        await response.json()

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
            Authorization:
              `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      const data =
        await response.json()

      setMessages(
        Array.isArray(data)
          ? data
          : data.results || []
      )
    } catch {
      // Automatic refresh:
      // no visible error needed here.
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

    const interval =
      setInterval(() => {
        loadMessages()
        loadTicket()
      }, 3000)

    return () =>
      clearInterval(interval)
  }, [id])

  useEffect(() => {
    messagesEndRef.current
      ?.scrollIntoView({
        behavior: 'smooth',
      })
  }, [messages])

  const handleSendMessage =
    async (event) => {
      event.preventDefault()

      const message =
        content.trim()

      if (!message) {
        return
      }

      setSending(true)
      setError('')

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/tickets/${id}/messages/`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Token ${token}`,
              },

              body: JSON.stringify({
                content: message,
              }),
            }
          )

        if (!response.ok) {
          const data =
            await response.json()

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

  const updateAgentStatus =
    async (newStatus) => {
      setError('')

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/tickets/${id}/update_status/`,
            {
              method: 'PATCH',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Token ${token}`,
              },

              body: JSON.stringify({
                status: newStatus,
              }),
            }
          )

        if (!response.ok) {
          const data =
            await response.json()

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

  const confirmResolution =
    async () => {
      setError('')

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/tickets/${id}/confirm_resolution/`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Token ${token}`,
              },
            }
          )

        if (!response.ok) {
          const data =
            await response.json()

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

  const reopenTicket =
    async () => {
      setError('')

      try {
        const response =
          await fetch(
            `http://127.0.0.1:8000/api/tickets/${id}/reopen/`,
            {
              method: 'PATCH',

              headers: {
                Authorization:
                  `Token ${token}`,
              },
            }
          )

        if (!response.ok) {
          const data =
            await response.json()

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
      <Alert severity="error">
        {error ||
          'Ticket introuvable.'}
      </Alert>
    )
  }

  const conversationDisabled =
    [
      'CLOSED',
      'CANCELLED',
    ].includes(ticket.status)

  const canSendMessages =
    (
      role === 'CLIENT' ||
      role === 'AGENT'
    ) &&
    !conversationDisabled

  const goBack = () => {
    if (role === 'AGENT') {
      navigate('/agent')
      return
    }

    navigate('/tickets')
  }

  return (
    <Box
      sx={{
        maxWidth: 1300,
        mx: 'auto',
      }}
    >
      <Button
        startIcon={
          <ArrowBackIcon />
        }
        onClick={goBack}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

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
            variant="overline"
            color="primary.light"
            fontWeight="bold"
          >
            TICKET #{ticket.id}
          </Typography>

          <Typography
            variant="h3"
            fontWeight="bold"
          >
            {ticket.title}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Chip
            label={
              statusLabels[
                ticket.status
              ] ||
              ticket.status
            }
            color={
              statusColors[
                ticket.status
              ] || 'default'
            }
          />

          <Chip
            variant="outlined"
            label={
              `Priorité : ${
                priorityLabels[
                  ticket.priority
                ] ||
                ticket.priority
              }`
            }
            color={
              priorityColors[
                ticket.priority
              ] || 'default'
            }
          />
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {role === 'AGENT' &&
        ticket.status === 'OPEN' && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            action={
              <Button
                color="inherit"
                startIcon={
                  <PlayArrowIcon />
                }
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
            Ce ticket vous a été
            affecté. Commencez son
            traitement pour travailler
            avec le client.
          </Alert>
        )}

      {role === 'AGENT' &&
        ticket.status ===
          'IN_PROGRESS' && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              gap: 2,
              border:
                '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Box>
              <Typography
                fontWeight="bold"
              >
                Traitement en cours
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Échangez avec le client,
                puis marquez le ticket
                résolu lorsque le problème
                est corrigé.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="success"
              startIcon={
                <CheckCircleIcon />
              }
              onClick={() =>
                updateAgentStatus(
                  'RESOLVED'
                )
              }
            >
              Marquer comme résolu
            </Button>
          </Paper>
        )}

      {role === 'AGENT' &&
        ticket.status ===
          'RESOLVED' && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Solution proposée. Le ticket
            reste en attente de
            confirmation du client.
          </Alert>
        )}

      {role === 'CLIENT' &&
        ticket.status ===
          'RESOLVED' && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border:
                '1px solid rgba(76,206,172,0.25)',
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
            >
              Votre problème est-il
              résolu ?
            </Typography>

            <Typography
              color="text.secondary"
              mt={0.7}
              mb={2.5}
            >
              L'agent indique que le
              problème a été résolu.
              Confirmez la solution ou
              poursuivez le traitement.
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
                startIcon={
                  <ReplayIcon />
                }
                onClick={
                  reopenTicket
                }
              >
                Problème persiste
              </Button>
            </Box>
          </Paper>
        )}

      {ticket.status ===
        'CLOSED' && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
          >
            Ce ticket est résolu et
            définitivement fermé.
          </Alert>
        )}

      {ticket.status ===
        'CANCELLED' && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            Ce ticket a été annulé.
          </Alert>
        )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            lg: '340px 1fr',
          },

          gap: 3,
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            height: 'fit-content',
            border:
              '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={2}
          >
            Informations
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Description
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              mb: 3,
              whiteSpace:
                'pre-wrap',
            }}
          >
            {ticket.description}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Statut
          </Typography>

          <Box sx={{ mt: 0.7 }}>
            <Chip
              size="small"
              label={
                statusLabels[
                  ticket.status
                ] ||
                ticket.status
              }
              color={
                statusColors[
                  ticket.status
                ] ||
                'default'
              }
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={3}
          >
            Priorité
          </Typography>

          <Box sx={{ mt: 0.7 }}>
            <Chip
              size="small"
              variant="outlined"
              label={
                priorityLabels[
                  ticket.priority
                ] ||
                ticket.priority
              }
              color={
                priorityColors[
                  ticket.priority
                ] ||
                'default'
              }
            />
          </Box>

          {ticket.created_at && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={3}
              >
                Créé le
              </Typography>

              <Typography
                variant="body2"
                mt={0.7}
              >
                {new Date(
                  ticket.created_at
                ).toLocaleString()}
              </Typography>
            </>
          )}
        </Paper>

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
              px: 3,
              py: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderBottom:
                '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <ForumOutlinedIcon
              color="primary"
            />

            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Conversation
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Client ↔ Agent
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              height: 480,
              overflowY: 'auto',
              px: {
                xs: 2,
                md: 3,
              },
              py: 3,
              backgroundColor:
                '#111827',
            }}
          >
            {messages.length === 0 && (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection:
                    'column',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                }}
              >
                <ForumOutlinedIcon
                  sx={{
                    fontSize: 45,
                    color:
                      'text.disabled',
                    mb: 1,
                  }}
                />

                <Typography
                  color="text.secondary"
                >
                  Aucun message pour le
                  moment.
                </Typography>
              </Box>
            )}

            {messages.map(
              (message) => {
                const mine =
                  message.sender_username
                  === username

                return (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection:
                        mine
                          ? 'row-reverse'
                          : 'row',
                      alignItems:
                        'flex-end',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,

                        bgcolor: mine
                          ? 'primary.main'
                          : 'secondary.main',

                        fontSize: 14,
                        fontWeight:
                          'bold',
                      }}
                    >
                      {message
                        .sender_username
                        ?.charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <Box
                      sx={{
                        maxWidth: {
                          xs: '80%',
                          md: '70%',
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display:
                            'block',
                          textAlign:
                            mine
                              ? 'right'
                              : 'left',
                          mb: 0.4,
                        }}
                      >
                        {mine
                          ? 'Vous'
                          : message.sender_username}
                      </Typography>

                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 1.5,

                          borderRadius:
                            mine
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px',

                          backgroundColor:
                            mine
                              ? 'primary.main'
                              : '#1f2a40',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              'pre-wrap',
                            wordBreak:
                              'break-word',
                          }}
                        >
                          {message.content}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display:
                              'block',
                            mt: 0.7,
                            opacity: 0.65,
                            textAlign:
                              'right',
                          }}
                        >
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                '2-digit',
                              minute:
                                '2-digit',
                            }
                          )}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                )
              }
            )}

            <div
              ref={
                messagesEndRef
              }
            />
          </Box>

          {canSendMessages ? (
            <Box
              component="form"
              onSubmit={
                handleSendMessage
              }
              sx={{
                p: 2.5,
                display: 'flex',
                gap: 1.5,
                alignItems:
                  'flex-end',

                borderTop:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={1}
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
                endIcon={
                  <SendIcon />
                }
                disabled={
                  sending ||
                  !content.trim()
                }
                sx={{
                  minHeight: 56,
                  px: 3,
                }}
              >
                {sending
                  ? 'Envoi...'
                  : 'Envoyer'}
              </Button>
            </Box>
          ) : (
            <Alert
              severity="info"
              sx={{
                m: 2,
              }}
            >
              {role === 'ADMIN'
                ? 'Conversation en lecture seule pour l’administrateur.'
                : 'La conversation est terminée.'}
            </Alert>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default TicketDetailPage
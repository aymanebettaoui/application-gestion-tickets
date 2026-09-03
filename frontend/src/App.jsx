import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import theme from './theme.js'

import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './components/DashboardPage.jsx'
import TicketsPage from './pages/TicketsPage.jsx'
import CreateTicketPage from './pages/CreateTicketPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AgentPage from './pages/AgentPage.jsx'

import DashboardLayout from './components/DashboardLayout.jsx'


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route element={<DashboardLayout />}>

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/tickets"
              element={<TicketsPage />}
            />

            <Route
              path="/new-ticket"
              element={<CreateTicketPage />}
            />

            <Route
              path="/admin"
              element={<AdminPage />}
            />

            <Route
              path="/agent"
              element={<AgentPage />}
            />

          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
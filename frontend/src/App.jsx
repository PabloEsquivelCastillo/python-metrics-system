import { BrowserRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App

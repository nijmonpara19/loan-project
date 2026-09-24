import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Predict from './pages/Predict.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Insights from './pages/Insights.jsx'
import About from './pages/About.jsx'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <div className="app__content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  )
}

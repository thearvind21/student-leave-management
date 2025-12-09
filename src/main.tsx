
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AdminProvider } from './context/AdminContext'

// Set the HTML class based on the saved theme or system preference
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('vite-ui-theme')
  if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
    return savedTheme
  }
  
  // Check system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefersDark ? 'dark' : 'light'
}

document.documentElement.classList.add(getInitialTheme())

createRoot(document.getElementById("root")!).render(
  <AdminProvider>
    <App />
  </AdminProvider>
);

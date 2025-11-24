import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'

const Popup = () => {
  return (
    <div style={{ padding: '20px', width: '300px', fontFamily: 'sans-serif' }}>
      <h1>LeetBot Settings</h1>
      <p>Configure your AI settings here.</p>
      {/* We can add API Key input here later */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)

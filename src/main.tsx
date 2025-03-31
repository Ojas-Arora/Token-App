import React from 'react'
import { createRoot } from 'react-dom/client'
import { WalletContextProvider } from './context/WalletContextProvider'
import '@solana/wallet-adapter-react-ui/styles.css'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

createRoot(rootElement).render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>,
)

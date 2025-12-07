import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { ChainlitAPI, ChainlitContext } from '@chainlit/react-client'
import './index.css'
import App from './App.jsx'

const CHAINLIT_SERVER_URL = 'http://localhost:8005'
const apiClient = new ChainlitAPI(CHAINLIT_SERVER_URL, 'webapp')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChainlitContext.Provider value={apiClient}>
      <RecoilRoot>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RecoilRoot>
    </ChainlitContext.Provider>
  </StrictMode>,
)

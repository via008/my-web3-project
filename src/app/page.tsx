'use client'

import { EOA_tx } from "./pages/EOA_tx"
import { Playground } from "./pages/playground"
import { USDCRead } from "./pages/USDC_read"
import { USDCWrite } from "./pages/USDC_write"

function App() {
  
  return (<div className="m-5 space-y-6">
      {/* <EOA_tx /> */}
      {/* <USDCRead />
      <USDCWrite /> */}
      <Playground />
    </div>
  )
}

export default App

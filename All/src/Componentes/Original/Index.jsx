import { useState } from 'react'
import './Style.css'

function Original() {
  const [count, setCount] = useState(0)

  return (
    <>
    <h1>Original</h1>      
    </>
  )
}

export default Original
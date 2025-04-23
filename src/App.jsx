import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, UNSAFE_DataRouterStateContext } from 'react-router-dom';


import './App.css'
import Aleatorios from './Componentes/Aleatorios/Index'
import Detalle from './Componentes/Detalle/Index'
import Favoritos from './Componentes/Favoritos/Index'
import Listar from './Componentes/Listar/Index'
import Original from './Componentes/Original/Index'
import Usuario from './Componentes/Usuario/Index'
import Menu from './Componentes/Menu/Index';

function App() {

  return (
    <Router>
      <Menu />
      <Routes>
      <Route path="/Listar" element={<Listar />} />
        <Route path="/detalle/:id" element={<Detalle />} />
        <Route path="/aleatorios" element={<Aleatorios />} />
        <Route path="/Original" element={<Original />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/Usuario" element={<Usuario />} />
      </Routes>
    </Router>
  )
}

export default App

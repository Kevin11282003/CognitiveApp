import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Aleatorios from './Componentes/Aleatorios/Index';
import Detalle from './Componentes/Detalle/Index';
import Favoritos from './Componentes/Favoritos/Index';
import Listar from './Componentes/Listar/Index';
import Original from './Componentes/Original/Index';
import Usuario from './Componentes/Usuario/Index';
import Menu from './menut';

function App() {
  const [tema, setTema] = useState('light'); // Estado para el tema actual

  // Función para cambiar el tema
  const cambiarTema = (nuevoTema) => {
    setTema(nuevoTema);
    document.body.setAttribute('data-theme', nuevoTema); // Cambiar el tema en el body
  };

  return (
    <Router>
      <Menu cambiarTema={cambiarTema} />
      <Routes>
        <Route path="/Listar" element={<Listar />} />
        <Route path="/detalle/:id" element={<Detalle />} />
        <Route path="/aleatorios" element={<Aleatorios />} />
        <Route path="/Original" element={<Original />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/Usuario" element={<Usuario />} />
      </Routes>
    </Router>
  );
}

export default App;

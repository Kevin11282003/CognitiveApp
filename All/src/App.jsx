import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { supabase } from "./supabase";  // Aquí importas tu configuración de Supabase

// Aquí tus componentes
import Login from './Componentes/Login/Index';
import Usuario from './Componentes/Usuario/Index';
import Menu from './menut';
import Listar from './Componentes/Listar/Index';
import Aleatorios from './Componentes/Aleatorios/Index';
import Favoritos from './Componentes/Favoritos/Index';
import Detalle from './Componentes/Detalle/Index';
import Registro from './Componentes/Registro/Index';
import Original from './Componentes/Original/Index';
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);  // Indicador de carga para saber si estamos verificando la sesión

  // Hook para verificar la sesión al inicio
  useEffect(() => {
    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession();  // Verifica si hay sesión activa

      // Si hay sesión activa, asignamos el usuario, si no, lo dejamos como null
      setUsuario(session?.user || null);

      setCargando(false);  // Desactivamos el indicador de carga cuando la sesión ha sido verificada
    }

    verificarSesion();

    // Escuchamos cambios en la sesión (si el usuario se loguea o cierra sesión)
    supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });
  }, []);

  // Si estamos verificando la sesión, mostramos un indicador de carga
  if (cargando) return <p>Cargando...</p>;

  return (
    <Router>
      <Menu />
      <main>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro/>} />


        <Route path="/usuario" element={usuario ? <Usuario /> : <Navigate to="/login" />}/>
        {/* Aquí otras rutas protegidas */}
        <Route path="/" element={usuario ? <Menu /> : <Navigate to="/login" />} />
        <Route path="/Listar" element={usuario ? <Listar /> : <Navigate to="/login" />} />
        <Route path="/aleatorios" element={usuario ? <Aleatorios /> : <Navigate to="/login" />} />
        <Route path="/favoritos" element={usuario ? <Favoritos /> : <Navigate to="/login" />} />
        <Route path="/Original" element={usuario ? <Original /> : <Navigate to="/login" />} />
        <Route path="/detalle/:id" element={usuario ? <Detalle /> : <Navigate to="/login" />} />
      </Routes>
      </main>
    </Router>
  );
}

export default App;

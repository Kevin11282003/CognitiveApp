import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { supabase } from "./supabase";  

// Componentes
import Login from './Componentes/Login/Index';
import Usuario from './Componentes/Usuario/Index';
import Menu from './menut';
import Inicio from './Componentes/Inicio/Index';
import Ejercicios from './Componentes/Ejercicios/Index';
import Progreso from './Componentes/Progreso/Index';
import Registro from './Componentes/Registro/Index';
import Accesibilidad from './Componentes/Accesibilidad/Index';
import Memoria from './Componentes/Memoria/Index';
import Palabras from './Componentes/PalabrasEncadenadas/Index';
import EjerFisicos from './Componentes/Reproductor/Index';
import Categoria from './Componentes/Reproductor/categorias';
import Logica from './Componentes/Logica/Index';
import CrudLogica from "./Componentes/CRUD/Logica";
import CrudEjercicios from "./Componentes/CRUD/Ejercicios";
import './App.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setUsuario(user);

      if (user) {
        const { data: userData, error } = await supabase
          .from("usuario")
          .select("roll")
          .eq("correo", user.email)
          .single();

        if (!error && userData) {
          setRol(userData.roll);
        } else {
          console.error("No se pudo obtener el rol del usuario:", error);
        }
      }

      setCargando(false);
    }

    verificarSesion();

    supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user || null);
    });
  }, []);

  if (cargando) return <p>Cargando...</p>;

  // 🔐 Componente para proteger rutas de administrador
  const RutaAdmin = ({ element }) => {
    if (!usuario) return <Navigate to="/login" />;
    if (rol !== "Admin") return <Navigate to="/Inicio" />;
    return element;
  };

  return (
    <Router>
      <Menu />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/usuario" element={usuario ? <Usuario /> : <Navigate to="/login" />} />
          <Route path="/" element={usuario ? <Navigate to="/Inicio" /> : <Navigate to="/login" />} />
          <Route path="/Inicio" element={usuario ? <Inicio /> : <Navigate to="/login" />} />
          <Route path="/Ejercicios" element={usuario ? <Ejercicios /> : <Navigate to="/login" />} />
          <Route path="/Progreso" element={usuario ? <Progreso usuarioId={usuario.id} /> : <Navigate to="/login" />} />
          <Route path="/Memoria" element={usuario ? <Memoria /> : <Navigate to="/login" />} />
          <Route path="/Palabras" element={usuario ? <Palabras /> : <Navigate to="/login" />} />
          <Route path="/Accesibilidad" element={usuario ? <Accesibilidad /> : <Navigate to="/login" />} />
          <Route path="/reproductor/:id" element={usuario ? <EjerFisicos /> : <Navigate to="/login" />} />
          <Route path="/categorias" element={usuario ? <Categoria /> : <Navigate to="/login" />} />
          <Route path="/logica" element={usuario ? <Logica /> : <Navigate to="/login" />} />

          {/* 🔒 Solo Admin puede entrar aquí */}
          <Route path="/admin/crud-logica" element={<RutaAdmin element={<CrudLogica />} />} />
          <Route path="/admin/crud-ejercicios" element={<RutaAdmin element={<CrudEjercicios />} />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
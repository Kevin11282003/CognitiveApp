import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import "../../App.css";

function MenuEjerciciosPorCategoria() {
  const [categorias, setCategorias] = useState([]);
  const [ejerciciosPorCategoria, setEjerciciosPorCategoria] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    cargarEjercicios();
  }, []);

  const cargarEjercicios = async () => {
    const { data, error } = await supabase
      .from("ejercicios")
      .select("id, titulo, categoria");

    if (error) {
      console.error("Error al cargar ejercicios:", error.message);
      return;
    }

    // Agrupar ejercicios por categoría
    const agrupado = {};
    data.forEach((ej) => {
      const cat = ej.categoria || "Sin categoría";
      if (!agrupado[cat]) agrupado[cat] = [];
      agrupado[cat].push(ej);
    });
    setEjerciciosPorCategoria(agrupado);
    setCategorias(Object.keys(agrupado));
  };

  const handleSeleccionEjercicio = (ejercicioId) => {
    navigate(`/reproductor/${ejercicioId}`);
  };

  return (
    <div className="menu-ejercicios">
      <h2>Ejercicios por categoría</h2>
      {categorias.map((cat) => (
        <div key={cat} style={{ marginBottom: "20px" }}>
          <h3>{cat}</h3>
          <ul>
            {ejerciciosPorCategoria[cat].map((ej) => (
              <li key={ej.id}>
                <button onClick={() => handleSeleccionEjercicio(ej.id)}>
                  {ej.titulo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default MenuEjerciciosPorCategoria;

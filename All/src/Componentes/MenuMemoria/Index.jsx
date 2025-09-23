import { useNavigate } from "react-router-dom";
import "../../App.css";

function MenuEjercicios() {
  const navigate = useNavigate();

  return (
    <div className="ejercicio-container">
      <h2>🧠 Menú de Ejercicios</h2>
      <p>Selecciona un juego para comenzar:</p>

      <div className="menu-opciones">
        <button
          onClick={() => navigate("/Memoria")}
          className="menu-boton"
        >
          🔢 Juego de Memoria <br />
          <small>(Secuencias de Números)</small>
        </button>

        <button
          onClick={() => navigate("/Palabras")}
          className="menu-boton"
        >
          ✍️ Fluidez Verbal <br />
          <small>(Palabras Encadenadas)</small>
        </button>
      </div>
    </div>
  );
}

export default MenuEjercicios;

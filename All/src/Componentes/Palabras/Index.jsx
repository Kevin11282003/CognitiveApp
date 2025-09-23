import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function EjercicioPalabrasEncadenadas() {
  const [palabras, setPalabras] = useState([]);
  const [entrada, setEntrada] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [tiempo, setTiempo] = useState(10); // tiempo por turno
  const [perdio, setPerdio] = useState(false);
  const [puntaje, setPuntaje] = useState(0);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 👉 Función para quitar tildes y pasar a minúscula
  const normalizar = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // 👉 Obtener palabra aleatoria de la RAE
  const fetchPalabraInicial = async () => {
    try {
      const res = await fetch("https://rae-api.com/api/random");
      const data = await res.json();
      if (data.ok) {
        setPalabras([data.data.word]); // se muestra con tilde si tiene
      } else {
        setPalabras(["inicio"]);
      }
    } catch (error) {
      console.error("Error obteniendo palabra inicial:", error);
      setPalabras(["inicio"]);
    }
  };

  // 👉 Verificar si palabra existe en la RAE
  const verificarPalabraDiccionario = async (palabra) => {
    try {
      const res = await fetch(
        `https://rae-api.com/api/words/${normalizar(palabra)}`
      );
      const data = await res.json();
      return data.ok;
    } catch (error) {
      console.error("Error verificando palabra:", error);
      return false;
    }
  };

  // 👉 Al iniciar o reiniciar
  useEffect(() => {
    fetchPalabraInicial();
  }, []);

  // 👉 Última palabra y su sílaba
  const ultimaPalabra = palabras[palabras.length - 1] || "";
  const obtenerUltimaSilaba = (palabra) => {
    if (palabra.length <= 2) return normalizar(palabra);
    return normalizar(palabra.slice(-2));
  };
  const ultimaSilaba = obtenerUltimaSilaba(ultimaPalabra);

  // 👉 Inicia cuenta regresiva cada vez que cambia palabra
  useEffect(() => {
    if (!ultimaPalabra) return;

    setTiempo(10);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTiempo((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPerdio(true);
          setMensaje("⏳ Se acabó el tiempo. ¡Perdiste!");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [palabras]);

  // 👉 Verificar palabra ingresada
  const handleVerificar = async () => {
    const palabraIngresadaNormalizada = normalizar(entrada.trim());

    if (!palabraIngresadaNormalizada) return;

    // Verificar que comience con última sílaba
    if (!palabraIngresadaNormalizada.startsWith(ultimaSilaba)) {
      setMensaje(`❌ La palabra debe empezar con "${ultimaSilaba.toUpperCase()}".`);
      setPerdio(true);
      return;
    }

    // Verificar si existe en diccionario
    const existe = await verificarPalabraDiccionario(entrada.trim());
    if (!existe) {
      setMensaje("❌ Esa palabra no existe en el diccionario español.");
      setPerdio(true);
      return;
    }

    // ✅ Correcto → añadir palabra (manteniendo tilde si tiene)
    setPalabras([...palabras, entrada.trim()]);
    setEntrada("");
    setMensaje("✅ ¡Bien hecho!");

    // Puntaje: +10 por palabra, + extra si sobró tiempo
    setPuntaje((p) => p + 10 + tiempo);
  };

  // 👉 Reiniciar juego
  const handleReiniciar = async () => {
    setPerdio(false);
    setMensaje(null);
    setPuntaje(0);
    setEntrada("");
    await fetchPalabraInicial();
  };

  return (
    <div className="ejercicio-container">
      <h2>✍️ Palabras Encadenadas</h2>
      <p>
        Escribe una palabra que empiece con la última sílaba resaltada de la
        palabra anterior.
      </p>

      {/* Mostrar palabra actual con sílaba resaltada */}
      {ultimaPalabra && (
        <h3>
          {ultimaPalabra.slice(0, -2)}
          <span style={{ color: "red", fontWeight: "bold" }}>
            {ultimaPalabra.slice(-2)}
          </span>
        </h3>
      )}

      {/* Input o botones si perdió */}
      {!perdio ? (
        <div>
          <input
            type="text"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            placeholder={`Debe empezar con "${ultimaSilaba}"`}
          />
          <button onClick={handleVerificar}>Ingresar</button>
        </div>
      ) : (
        <div style={{ marginTop: "15px" }}>
          <button onClick={handleReiniciar}>🔄 Reintentar</button>
          <button onClick={() => navigate("/Ejercicios")}>🏠 Menú</button>
        </div>
      )}

      {/* Tiempo restante */}
      {!perdio && (
        <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
          ⏳ Tiempo restante: {tiempo} segundos
        </p>
      )}

      {/* Puntaje */}
      <p style={{ marginTop: "10px", fontWeight: "bold" }}>🏆 Puntaje: {puntaje}</p>

      {/* Mensajes */}
      {mensaje && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "8px",
            background: mensaje.includes("✅") ? "#4caf50" : "#f44336",
            color: "white",
          }}
        >
          {mensaje}
        </div>
      )}

      <h4>Lista de palabras:</h4>
      <ul>
        {palabras.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

export default EjercicioPalabrasEncadenadas;

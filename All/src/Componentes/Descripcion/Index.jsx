import { useEffect } from "react";
import "../../App.css";


const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const contentStyle = {
  backgroundColor: "white",
  padding: "20px 30px",
  borderRadius: "10px",
  maxWidth: "400px",
  width: "90%",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

function InstruccionesModal({ titulo, texto, onContinuar }) {
  // Función para hablar
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Detener voz
  const detenerVoz = () => {
    window.speechSynthesis.cancel();
  };

  // Hablar automáticamente al montar
  useEffect(() => {
    speak(texto);
    return () => detenerVoz(); // Limpieza al desmontar
  }, [texto]);

  const handleClick = () => {
    detenerVoz();
    onContinuar();
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h2>{titulo}</h2>
        <p>{texto}</p>
        <button style={buttonStyle} onClick={onContinuar}>
          Continuar 🚀
        </button>
      </div>
    </div>
  );
}

export default InstruccionesModal;

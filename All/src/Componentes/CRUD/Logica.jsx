import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import "../../App.css";// 👈 importa el CSS

function CrudLogica() {
  const [preguntas, setPreguntas] = useState([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [editando, setEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  useEffect(() => {
    obtenerPreguntas();
  }, []);

  async function obtenerPreguntas() {
    const { data, error } = await supabase
      .from("ejercicios_logica")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setPreguntas(data);
  }

  async function agregarPregunta() {
    if (!nuevaPregunta.trim()) return;
    await supabase.from("ejercicios_logica").insert([{ pregunta: nuevaPregunta }]);
    setNuevaPregunta("");
    obtenerPreguntas();
  }

  async function eliminarPregunta(id) {
    await supabase.from("ejercicios_logica").delete().eq("id", id);
    obtenerPreguntas();
  }

  async function guardarEdicion(id) {
    await supabase.from("ejercicios_logica").update({ pregunta: textoEditado }).eq("id", id);
    setEditando(null);
    setTextoEditado("");
    obtenerPreguntas();
  }

  return (
    <div className="crud-logica-container">
      <h2 className="crud-logica-titulo">🧩 CRUD - Ejercicios de Lógica</h2>

      <div className="crud-logica-formulario">
        <input
          type="text"
          className="crud-logica-input"
          placeholder="Nueva pregunta"
          value={nuevaPregunta}
          onChange={(e) => setNuevaPregunta(e.target.value)}
        />
        <button className="crud-logica-boton-agregar" onClick={agregarPregunta}>
          Agregar
        </button>
      </div>

      <ul className="crud-logica-lista">
        {preguntas.map((p) => (
          <li className="crud-logica-item" key={p.id}>
            {editando === p.id ? (
              <div className="crud-logica-edicion">
                <input
                  type="text"
                  className="crud-logica-input-editar"
                  value={textoEditado}
                  onChange={(e) => setTextoEditado(e.target.value)}
                />
                <button
                  className="crud-logica-boton-guardar"
                  onClick={() => guardarEdicion(p.id)}
                >
                  Guardar
                </button>
              </div>
            ) : (
              <div className="crud-logica-item-contenido">
                <span className="crud-logica-pregunta">{p.pregunta}</span>
                <div className="crud-logica-botones">
                  <button
                    className="crud-logica-boton-editar"
                    onClick={() => {
                      setEditando(p.id);
                      setTextoEditado(p.pregunta);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="crud-logica-boton-eliminar"
                    onClick={() => eliminarPregunta(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CrudLogica;

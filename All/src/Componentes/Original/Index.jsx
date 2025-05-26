// MemoryGame.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./Stylex.css";

export default function MemoryGame() {
  const [todos, setTodos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [difficulty, setDifficulty] = useState(8); // 8, 16, or 32 cards
  const [flippedCards, setFlippedCards] = useState([]); // indices of flipped cards
  const [matchedPairs, setMatchedPairs] = useState([]); // matched card objects
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showVictoryMessage, setShowVictoryMessage] = useState(false);

  useEffect(() => {
    const cargarDigimons = async () => {
      setCargando(true);
      try {
        let ids = [];
        for (let page = 0; page < 10; page++) {
          const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
          const json = await res.json();
          ids = ids.concat(json.content.map(d => d.id));
        }
        const peticiones = ids.map(id =>
          fetch(`https://digi-api.com/api/v1/digimon/${id}`)
            .then(res => res.json())
            .catch(() => null)
        );
        const resultados = await Promise.all(peticiones);
        const datosCompletos = resultados.filter(d => d !== null && d.name);
        setTodos(datosCompletos);
      } catch (error) {
        console.error("Error obteniendo Digimons:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDigimons();
  }, []);

  const gameImages = useMemo(() => {
    if (todos.length > 0) {
      const totalCards = difficulty;
      let selectedImages = [];
      for (let i = 0; i < totalCards / 2; i++) {
        selectedImages.push(todos[i % todos.length]);
      }
      let allCards = [...selectedImages, ...selectedImages];
      allCards = allCards.sort(() => Math.random() - 0.5);
      return allCards;
    }
    return [];
  }, [todos, difficulty]);

  const handleCardFlip = (index) => {
    if (flippedCards.length < 2 && !flippedCards.includes(index)) {
      const newFlippedCards = [...flippedCards, index];
      setFlippedCards(newFlippedCards);

      if (newFlippedCards.length === 2) {
        const [firstCard, secondCard] = newFlippedCards;
        if (gameImages[firstCard].id === gameImages[secondCard].id) {
          setMatchedPairs(prev => [...prev, gameImages[firstCard]]);
        }
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const resetGame = () => {
    setMatchedPairs([]);
    setFlippedCards([]);
    setGameOver(false);
    setStartTime(new Date());
    setElapsedTime(0);
    setShowVictoryMessage(false);
  };

  useEffect(() => {
    resetGame();
  }, [difficulty]);

  useEffect(() => {
    if (matchedPairs.length === gameImages.length / 2 && gameImages.length > 0) {
      setGameOver(true);
      setShowVictoryMessage(true);
    }
  }, [matchedPairs, gameImages]);

  useEffect(() => {
    if (startTime && !gameOver) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        setElapsedTime(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, gameOver]);

  return (
    <div className="container">
      <h1 className="title">Juego de Memoria</h1>

      <div className="difficulty-container">
        <span className="difficulty-text">Dificultad:</span>
        {[8,16,32].map(level => (
          <button
            key={level}
            className={`difficulty-button ${difficulty === level ? "active" : ""}`}
            onClick={() => setDifficulty(level)}
          >
            {level === 8 ? "Fácil (8)" : level === 16 ? "Intermedio (16)" : "Difícil (32)"}
          </button>
        ))}
      </div>

      <div className="stats-container">
        <p>Juego: {gameOver ? "Terminado" : "En Curso"}</p>
        <p>Pares encontrados: {matchedPairs.length}/{gameImages.length / 2}</p>
        <p>Tiempo: {elapsedTime}s</p>
      </div>

      {cargando ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="grid">
          {gameImages.map((item, index) => {
            const isFlipped = flippedCards.includes(index);
            const isMatched = matchedPairs.some(mp => mp.id === item.id);

            return (
              <div
                key={index}
                className={`card ${isFlipped || isMatched ? "flipped" : "hidden"}`}
                onClick={() => !isFlipped && !isMatched && !gameOver && handleCardFlip(index)}
              >
                {(isFlipped || isMatched) ? (
                  <>
                    <img
                      src={item.images?.[0]?.href || "https://via.placeholder.com/70?text=No+Img"}
                      alt={item.name}
                      className="card-image"
                    />
                    <div className="card-text">{item.name}</div>
                  </>
                ) : (
                  <img
                    src="https://i.pinimg.com/originals/8d/3e/c9/8d3ec9607e4297dbdf882ade768b64cb.jpg"
                    alt="Carta Oculta"
                    className="card-image"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <button className="reset-button" onClick={resetGame}>Reiniciar Juego</button>

      {showVictoryMessage && (
        <div className="victory-message">
          <h2>¡Ganaste!</h2>
          <p>Tiempo total: {elapsedTime} segundos</p>
        </div>
      )}
    </div>
  );
}

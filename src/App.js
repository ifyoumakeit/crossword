import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function getIndexNext(grid = [], index = 0, adder = 0) {
  const indexNext = index + adder;

  if (grid[indexNext]) {
    console.log(indexNext);
    if (grid[indexNext] === ".") {
      return getIndexNext(grid, indexNext, adder);
    }
    return indexNext;
  }

  return index;
}

function App(props) {
  const { size, grid, gridnums } = props;
  const cells = size.cols * size.rows;
  const lettersInitial = Array.from({ length: cells }, () => "");
  const [letters, setLetters] = useState(lettersInitial);
  const [indexCurrent, setIndexCurrent] = useState(0);
  const [isAcross, setIsAcross] = useState(true);
  const refs = Array.from({ length: cells }, () => useRef(null));

  function goUp() {
    return setIndexCurrent(getIndexNext(grid, indexCurrent, -size.rows));
  }

  function goRight() {
    return setIndexCurrent(getIndexNext(grid, indexCurrent, 1));
  }

  function goDown() {
    return setIndexCurrent(getIndexNext(grid, indexCurrent, size.rows));
  }

  function goLeft() {
    return setIndexCurrent(getIndexNext(grid, indexCurrent, -1));
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowUp": {
        setIsAcross(false);
        return goUp();
      }
      case "ArrowRight": {
        setIsAcross(true);
        return goRight();
      }
      case "ArrowDown": {
        setIsAcross(false);
        return goDown();
      }
      case "ArrowLeft": {
        setIsAcross(true);
        return goLeft();
      }
      case "Tab": {
        event.preventDefault();
        if (isAcross) {
          return event.shiftKey ? goLeft() : goRight();
        }
        return event.shiftKey ? goUp() : goDown();
      }
      default: {
        return;
      }
    }
  }

  useEffect(
    () => {
      window.addEventListener("keydown", handleKeyDown);
      refs[indexCurrent].current && refs[indexCurrent].current.focus();
      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    [indexCurrent]
  );

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}
    >
      <div
        className="App"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid black",
          margin: "auto"
        }}
      >
        {Array.from({ length: size.rows }, (_, i) => {
          return (
            <div style={{ display: "flex" }} key={i}>
              {Array.from({ length: size.cols }, (_, j) => {
                const index = i * size.rows + j;
                const letter = grid[index];
                const number = gridnums[index];
                const isBlack = letter === ".";
                return (
                  <div
                    key={index}
                    style={{
                      width: "25px",
                      height: "25px",
                      backgroundColor: isBlack ? "black" : "white",
                      border: "1px solid black",
                      position: "relative",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    {number > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "0px",
                          left: "2px",
                          fontSize: "7px"
                        }}
                      >
                        {number}
                      </span>
                    )}
                    {!isBlack && (
                      <input
                        value={letters[index] || ""}
                        ref={refs[index]}
                        onFocus={() => setIndexCurrent(index)}
                        onChange={event => {
                          const { value } = event.currentTarget;
                          const valueSingle = value[value.length - 1];
                          setLetters([
                            ...letters.slice(0, index),
                            valueSingle,
                            ...letters.slice(index + 1)
                          ]);

                          if (isAcross) {
                            return goRight();
                          }
                          return goDown();
                        }}
                        style={{
                          position: "absolute",
                          appearance: "none",
                          border: 0,
                          outline: 0,
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                          textAlign: "center"
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

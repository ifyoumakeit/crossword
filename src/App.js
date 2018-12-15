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

function isBlack(val) {
  return val === ".";
}

function App(props) {
  const { size, grid, gridnums } = props;
  const cells = size.cols * size.rows;

  // Create updaters for all pieces of state
  const [indexCurrent, setIndexCurrent] = useState(0);
  const [isAcross, setIsAcross] = useState(true);
  const [letters, setLetters] = useState(
    Array.from({ length: cells }, () => "")
  );

  // Set references to all inputs, skip black cells.
  const refs = Array.from({ length: cells }, i =>
    !isBlack(grid[i]) ? useRef(null) : null
  );

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
      if (refs[indexCurrent] && refs[indexCurrent].current) {
        // Go to next input if its available.
        refs[indexCurrent].current.focus();
      }
      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    [indexCurrent]
  );

  return (
    <main className="main">
      <section className="crossword">
        {Array.from({ length: size.rows }, (_, i) => {
          return (
            <div className="row" key={i}>
              {Array.from({ length: size.cols }, (_, j) => {
                const index = i * size.rows + j;
                const letter = grid[index];
                const number = gridnums[index];

                return (
                  <div
                    key={index}
                    className="cell"
                    style={{
                      "--bgcolor": isBlack(letter)
                        ? "black"
                        : index === indexCurrent
                        ? "#efefef"
                        : "white"
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
                    {!isBlack(letter) && (
                      <input
                        className="input"
                        value={letters[index]}
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
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default App;

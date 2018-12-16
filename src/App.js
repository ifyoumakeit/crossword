import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function getIndexNext(index = 0, adder = 0, cellFn = () => {}) {
  const indexNext = index + adder;
  const cellNext = cellFn(indexNext);

  if (cellNext) {
    if (cellNext === ".") {
      return getIndexNext(indexNext, adder, cellFn);
    }
    return indexNext;
  }

  return index;
}

const DIRECTIONS = {
  up: "up",
  right: "right",
  down: "down",
  left: "left"
};

function getAdder(direction = DIRECTIONS.up, rows) {
  return (
    {
      up: -rows,
      right: 1,
      down: rows,
      left: -1
    }[direction] || 0
  );
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

  // Go in a certain direction.
  function go(direction) {
    setIsAcross([DIRECTIONS.left, DIRECTIONS.right].includes(direction));
    setIndexCurrent(
      getIndexNext(
        indexCurrent,
        getAdder(direction, size.rows),
        index => grid[index]
      )
    );
    return;
  }

  function handleKeyDown(event) {
    switch (event.key) {
      case "ArrowUp": {
        return go(DIRECTIONS.up);
      }
      case "ArrowRight": {
        return go(DIRECTIONS.right);
      }
      case "ArrowDown": {
        return go(DIRECTIONS.down);
      }
      case "ArrowLeft": {
        return go(DIRECTIONS.left);
      }
      case "Tab": {
        event.preventDefault();
        if (isAcross) {
          return event.shiftKey ? go(DIRECTIONS.left) : go(DIRECTIONS.right);
        }
        return event.shiftKey ? go(DIRECTIONS.up) : go(DIRECTIONS.down);
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
      <section className="crossword" style={{ "--rows": size.rows }}>
        {grid.map((letter, index) => {
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
              {number > 0 && <span className="num">{number}</span>}
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
                      return go(DIRECTIONS.right);
                    }
                    return go(DIRECTIONS.down);
                  }}
                />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}

export default App;

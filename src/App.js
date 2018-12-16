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

function getCluesLookup(grid, gridnums, rows) {
  return grid.map((letter, index) => {
    if (letter === ".") {
      return 0;
    }

    const col = Math.floor(index / rows);
    const offset = col * rows;
    const slice = grid.slice(offset, index);

    // Look through row for first sign of .
    const numberAssocIndex = slice.reverse().findIndex(val => val === ".");

    const numberAssocIndexNormalized =
      numberAssocIndex < 0 ? offset : offset + slice.length - numberAssocIndex;

    const numberAssoc = gridnums[numberAssocIndexNormalized];
    return numberAssoc;
  });
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
  const [cluesLookup, setCluesLookup] = useState(
    getCluesLookup(grid, gridnums, size.rows)
  );

  // Set references to all inputs, skip black cells.
  const refs = Array.from({ length: cells }, i =>
    !isBlack(grid[i]) ? useRef(null) : null
  );

  useEffect(
    () => {
      window.addEventListener("keydown", handleKeyDown);
      if (refs[indexCurrent] && refs[indexCurrent].current) {
        // Go to next input if its available.
        refs[indexCurrent].current.focus();
      }

      // Update clues if they change
      setCluesLookup(getCluesLookup(grid, gridnums, size.rows));

      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    [indexCurrent, grid, gridnums]
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

  return (
    <main className="main">
      <section className="crossword" style={{ "--rows": size.rows }}>
        {grid.map((letter, index) => {
          const number = gridnums[index];
          const clue = cluesLookup[index];

          return (
            <div
              key={index}
              className="cell"
              style={{
                "--bgcolor": isBlack(letter)
                  ? "black"
                  : index === indexCurrent
                  ? "#efefef"
                  : clue === cluesLookup[indexCurrent]
                  ? "#eaeaea"
                  : "white"
              }}
            >
              {number > 0 && <span className="num">{number}</span>}
              {!isBlack(letter) && (
                <input
                  className="input"
                  name={`cell-${index}`}
                  value={letters[index]}
                  ref={refs[index]}
                  onFocus={() => {
                    setIndexCurrent(index);
                  }}
                  onChange={event => {
                    const { value } = event.currentTarget;
                    const valueSingle = value[value.length - 1];

                    if (!/[A-z]/.test(valueSingle)) {
                      return; // Skip non-letters.
                    }

                    setLetters([
                      ...letters.slice(0, index),
                      valueSingle.toUpperCase(),
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

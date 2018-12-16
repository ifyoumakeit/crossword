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

function getCluesLookup(grid, gridnums, cols) {
  return grid.reduce(
    (acc, letter, index) => {
      if (letter === ".") {
        return {
          ...acc,
          across: acc.across.concat(null)
        };
      }

      // Look through row for first sign of .
      const acrossRowCurrent = Math.floor(index / cols);
      const acrossRowOffset = cols * acrossRowCurrent;
      const acrossSlice = grid.slice(acrossRowOffset, index);
      const acrossDotOffset = acrossSlice
        .reverse()
        .findIndex(val => val === ".");
      const acrossDotIndex =
        acrossDotOffset < 0
          ? acrossRowOffset
          : acrossRowOffset + acrossSlice.length - acrossDotOffset;
      const acrossClueNumber = gridnums[acrossDotIndex];
      const acrossCounter =
        acc.acrossNumber === acrossClueNumber
          ? acc.acrossCounter
          : acc.acrossCounter + 1;

      return {
        ...acc,
        acrossCounter,
        acrossNumber: acrossClueNumber,
        across: acc.across.concat(acrossCounter)
      };
    },
    {
      acrossNumber: 0,
      acrossCounter: 0,
      across: [],
      downNumber: 0,
      downCounter: 0,
      down: []
    }
  );
}

function App({ size, grid, gridnums, ...props }) {
  const cells = size.cols * size.rows;

  // Create updaters for all pieces of state
  const [indexCurrent, setIndexCurrent] = useState(0);
  const [isAcross, setIsAcross] = useState(true);
  const [letters, setLetters] = useState(
    Array.from({ length: cells }, () => "")
  );
  const [cluesLookup, setCluesLookup] = useState(
    getCluesLookup(grid, gridnums, size.cols)
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
      setCluesLookup(getCluesLookup(grid, gridnums, size.cols));

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
          const clue = cluesLookup.across[index];

          return (
            <div
              key={index}
              className="cell"
              style={{
                "--bgcolor": isBlack(letter)
                  ? "#000000"
                  : index === indexCurrent
                  ? "#efefef"
                  : clue === cluesLookup.across[indexCurrent]
                  ? "#dddddd"
                  : "#ffffff"
              }}
            >
              {number > 0 && <span className="num">{number}</span>}
              {!isBlack(letter) && (
                <input
                  className="input"
                  name={`cell-${index}`}
                  value={letters[index]}
                  ref={refs[index]}
                  onFocus={() => setIndexCurrent(index)}
                  onChange={() => {
                    /* Handled by keydown */
                  }}
                  onKeyDown={event => {
                    const key = event.key;
                    const value = key === "Backspace" ? "" : key;

                    if (value && !/^[a-zA-Z]$/.test(value)) {
                      return; // Skip non-letters or multi-letter keys.
                    }

                    setLetters([
                      ...letters.slice(0, index),
                      value.toUpperCase(),
                      ...letters.slice(index + 1)
                    ]);

                    if (isAcross) {
                      return value ? go(DIRECTIONS.right) : go(DIRECTIONS.left);
                    }
                    return value ? go(DIRECTIONS.down) : go(DIRECTIONS.up);
                  }}
                />
              )}
            </div>
          );
        })}
      </section>
      <h1>Clues</h1>

      {["across", "down"].map(key => (
        <section key={key}>
          <h1>{key}</h1>
          <ul>
            {props.clues[key].map((clue, index) => (
              <li
                key={clue}
                className="clue"
                style={{
                  "--bgcolor":
                    cluesLookup.across[indexCurrent] - 1 === index
                      ? "#efefef"
                      : "#ffffff"
                }}
              >
                {clue}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

export default App;

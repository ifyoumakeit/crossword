import React, { useState, useEffect, useRef } from "react";
import getCluesLookup from "./utils/get_clues_lookup";
import getNextIndex from "./utils/get_next_index";
import { BLANK_CHAR } from "./constants";

import "./App.css";

function isBlack(val) {
  return val === BLANK_CHAR;
}

function getDirectionKey(isAcross) {
  return isAcross ? "across" : "down";
}

function App({
  size = { rows: 0, cols: 0 },
  grid = [],
  gridnums = [],
  clues = {
    across: [],
    down: []
  }
}) {
  // Create updaters for all pieces of state
  const [indexCurrent, setIndexCurrent] = useState(0);
  const [isAcross, setIsAcross] = useState(true);
  const [letters, setLetters] = useState(grid.map(() => ""));
  const [cluesLookup, setCluesLookup] = useState(() =>
    getCluesLookup(grid, size.cols)
  );

  // Set references to all inputs, skip black cells.
  const refs = grid.map((letter, i) =>
    !isBlack(letter) ? useRef(null) : null
  );

  useEffect(
    () => {
      if (refs[indexCurrent] && refs[indexCurrent].current) {
        // Go to next input if its available.
        refs[indexCurrent].current.focus();
      }
    },
    [indexCurrent]
  );

  useEffect(
    () => {
      function handleKeyDown(event) {
        setIndexCurrent(indexCurrent => {
          if (isAcross) {
            const left = () => getNextIndex(indexCurrent, grid, -1);
            const right = () => getNextIndex(indexCurrent, grid, +1);

            if (event.key === "ArrowLeft") return left();
            if (event.key === "ArrowRight") return right();
            if (event.key === "Tab") return event.shiftKey ? left() : right();

            return indexCurrent;
          }

          const up = () => getNextIndex(indexCurrent, grid, -size.rows);
          const down = () => getNextIndex(indexCurrent, grid, +size.rows);

          if (event.key === "ArrowUp") return up();
          if (event.key === "ArrowDown") return down();
          if (event.key === "Tab") return event.shiftKey ? up() : down();

          return indexCurrent;
        });

        setIsAcross(isAcross => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) return true;
          if (["ArrowDown", "ArrowUp"].includes(event.key)) return false;
          return isAcross;
        });
      }

      window.addEventListener("keydown", handleKeyDown);
      setCluesLookup(getCluesLookup(grid, size.cols));
      return () => window.removeEventListener("keydown", handleKeyDown);
    },
    [grid, gridnums, isAcross]
  );

  return (
    <main className="main">
      <section className="crossword" style={{ "--rows": size.rows }}>
        {grid.map((letter, index) => {
          const number = gridnums[index];
          const clue = cluesLookup[getDirectionKey(isAcross)][index];

          return (
            <div
              key={index}
              className="cell"
              style={{
                "--bgcolor": isBlack(letter)
                  ? "#000000"
                  : index === indexCurrent
                  ? "#efefef"
                  : clue ===
                    cluesLookup[getDirectionKey(isAcross)][indexCurrent]
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
                  onFocus={() => {
                    setIndexCurrent(index);
                  }}
                  onChange={() => {}}
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

                    const go = {
                      up: () => getNextIndex(indexCurrent, grid, -size.rows),
                      right: () => getNextIndex(indexCurrent, grid, +1),
                      down: () => getNextIndex(indexCurrent, grid, +size.rows),
                      left: () => getNextIndex(indexCurrent, grid, -1)
                    };

                    if (isAcross) {
                      return setIndexCurrent(value ? go.right() : go.left());
                    }
                    return setIndexCurrent(value ? go.down() : go.up());
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
            {clues[key].map((clue, index) => (
              <li
                key={clue}
                className="clue"
                style={{
                  "--bgcolor":
                    getDirectionKey(isAcross) === key &&
                    cluesLookup[getDirectionKey(isAcross)][indexCurrent] ===
                      index
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

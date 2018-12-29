import React, { useState, useEffect, useRef, useMemo } from "react";
import getCluesLookup from "./utils/get_clues_lookup";
import getNextIndex from "./utils/get_next_index";
import { BLANK_CHAR, EVENTS } from "./constants";

import "./App.css";

function isBlack(val) {
  return val === BLANK_CHAR;
}

function isLetter(val) {
  return /^[a-zA-Z]$/.test(val);
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
  const cluesLookup = useMemo(() => getCluesLookup(grid, size.cols), [grid]);

  // Set references to all inputs, skip black cells.
  const refs = grid.map(letter => (!isBlack(letter) ? useRef(null) : null));

  useEffect(
    () => {
      if (refs[indexCurrent] && refs[indexCurrent].current) {
        // Go to next input if its available.
        refs[indexCurrent].current.focus();
      }
    },
    [indexCurrent]
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
                  onFocus={() => setIndexCurrent(index)}
                  onChange={() => {}}
                  onKeyDown={event => {
                    event.persist();
                    setIndexCurrent(indexCurrent => {
                      if (isAcross) {
                        if (
                          event.key === EVENTS.Backspace ||
                          event.key === EVENTS.ArrowLeft ||
                          (event.key === EVENTS.Tab && event.shiftKey)
                        ) {
                          return getNextIndex(indexCurrent, grid, -1);
                        }

                        if (
                          event.key === EVENTS.ArrowRight ||
                          event.key === EVENTS.Tab ||
                          isLetter(event.key)
                        ) {
                          return getNextIndex(indexCurrent, grid, +1);
                        }
                      }

                      if (!isAcross) {
                        if (
                          event.key === EVENTS.Backspace ||
                          event.key === EVENTS.ArrowUp ||
                          (event.key === EVENTS.Tab && event.shiftKey)
                        ) {
                          {
                            return getNextIndex(indexCurrent, grid, -size.rows);
                          }
                        }
                        if (
                          event.key === EVENTS.ArrowDown ||
                          event.key === EVENTS.Tab ||
                          isLetter(event.key)
                        ) {
                          return getNextIndex(indexCurrent, grid, size.rows);
                        }
                      }

                      return indexCurrent;
                    });

                    setIsAcross(isAcross => {
                      if (
                        event.key === EVENTS.ArrowLeft ||
                        event.key === EVENTS.ArrowRight
                      ) {
                        return true;
                      }
                      if (
                        event.key === EVENTS.ArrowDown ||
                        event.key === EVENTS.ArrowUp
                      ) {
                        return false;
                      }
                      if (isLetter(event.key)) {
                        return isAcross;
                      }
                      return isAcross;
                    });

                    const value = event.key;
                    if (isLetter(value)) {
                      setLetters(letters => [
                        ...letters.slice(0, index),
                        value.toUpperCase(),
                        ...letters.slice(index + 1)
                      ]);
                    }
                  }}
                />
              )}
            </div>
          );
        })}
      </section>
      <aside className="aside">
        <h1 className="title">Clues</h1>

        {["across", "down"].map(key => (
          <section key={key}>
            <h1 className="title">{key.toUpperCase()}</h1>
            <ul className="clues">
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
      </aside>
    </main>
  );
}

export default App;

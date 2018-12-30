import React, { useEffect, useRef, useMemo, useReducer } from "react";
import getCluesLookup from "./utils/get_clues_lookup";
import getNextIndex from "./utils/get_next_index";
import { BLANK_CHAR, EVENTS } from "./constants";

import styles from "./App.module.css";

function isBlack(val) {
  return val === BLANK_CHAR;
}

function isLetter(val) {
  return /^[a-zA-Z]$/.test(val);
}

const ACTIONS = {
  SET_INDEX: "SET_INDEX",
  SET_LETTERS: "SET_LETTERS",
  SET_ACROSS: "SET_ACROSS",
  GO_NEXT: "GO_NEXT",
  GO_PREV: "GO_PREV"
};

function reducer(state, action = {}) {
  switch (action.type) {
    case ACTIONS.SET_LETTERS: {
      const { letter } = action.payload;
      return {
        ...state,
        letters: [
          ...state.letters.slice(0, state.index),
          letter.toUpperCase(),
          ...state.letters.slice(state.index + 1)
        ]
      };
    }
    case ACTIONS.SET_ACROSS: {
      const { isAcross } = action.payload;
      return {
        ...state,
        isAcross
      };
    }
    case ACTIONS.SET_INDEX: {
      const { index } = action.payload;
      return {
        ...state,
        index: index
      };
    }
    case ACTIONS.GO_NEXT: {
      return {
        ...state,
        index: getNextIndex(
          state.index,
          state.grid,
          state.isAcross ? 1 : state.rows
        )
      };
    }
    case ACTIONS.GO_PREV: {
      return {
        ...state,
        index: getNextIndex(
          state.index,
          state.grid,
          state.isAcross ? -1 : -state.rows
        )
      };
    }
    default: {
      return state;
    }
  }
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
  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    isAcross: true,
    letters: grid.map(() => ""),
    grid,
    rows: size.rows
  });

  const keyDirection = state.isAcross ? "across" : "down";
  const cluesLookup = useMemo(() => getCluesLookup(grid, size.cols), [grid]);

  // Set references to all inputs, skip black cells.
  const refs = grid.map(letter => (!isBlack(letter) ? useRef(null) : null));

  useEffect(
    () => {
      // Focus on next input if index changes.
      if (refs[state.index] && refs[state.index].current) {
        refs[state.index].current.focus();
      }
    },
    [state.index]
  );

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target.className !== styles.input) {
        return dispatch({ type: ACTIONS.SET_INDEX, payload: { index: -1 } });
      }

      event.preventDefault();
      if (isLetter(event.key) || event.key === EVENTS.Backspace) {
        dispatch({
          type: ACTIONS.SET_LETTERS,
          payload: { letter: event.key === EVENTS.Backspace ? "" : event.key }
        });
      }

      if (
        event.key === EVENTS.ArrowLeft ||
        event.key === EVENTS.ArrowRight ||
        event.key === EVENTS.ArrowDown ||
        event.key === EVENTS.ArrowUp
      ) {
        dispatch({
          type: ACTIONS.SET_ACROSS,
          payload: {
            isAcross:
              event.key === EVENTS.ArrowLeft || event.key === EVENTS.ArrowRight
          }
        });
      }

      if (
        (state.isAcross && event.key === EVENTS.ArrowLeft) ||
        (!state.isAcross && event.key === EVENTS.ArrowUp) ||
        (event.key === EVENTS.Tab && event.shiftKey) ||
        event.key === EVENTS.Backspace
      ) {
        dispatch({ type: ACTIONS.GO_PREV });
      }

      if (
        (state.isAcross && event.key === EVENTS.ArrowRight) ||
        (!state.isAcross && event.key === EVENTS.ArrowDown) ||
        event.key === EVENTS.Tab ||
        isLetter(event.key)
      ) {
        dispatch({ type: ACTIONS.GO_NEXT });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className={styles.main}>
      <section className={styles.crossword} style={{ "--rows": size.rows }}>
        {grid.map((letter, index) => {
          const number = gridnums[index];
          const bgColor = isBlack(letter)
            ? "#000000"
            : index === state.index
            ? "#efefef"
            : cluesLookup[keyDirection][index] ===
              cluesLookup[keyDirection][state.index]
            ? "#dddddd"
            : "#ffffff";

          return (
            <div
              key={index}
              className={styles.cell}
              style={{ "--bgcolor": bgColor }}
            >
              {number > 0 && <span className={styles.num}>{number}</span>}
              {!isBlack(letter) && (
                <button
                  className={styles.input}
                  name={`cell-${index}`}
                  ref={refs[index]}
                  onFocus={() =>
                    dispatch({ type: ACTIONS.SET_INDEX, payload: { index } })
                  }
                >
                  {state.letters[index]}
                </button>
              )}
            </div>
          );
        })}
      </section>
      <aside className={styles.aside}>
        <h1 className={styles.title}>Clues</h1>

        {["across", "down"].map(key => (
          <section key={key}>
            <h1 className={styles.title}>{key.toUpperCase()}</h1>
            <ul className={styles.clues}>
              {clues[key].map((clue, index) => (
                <li
                  key={clue}
                  className={styles.clue}
                  style={{
                    "--bgcolor":
                      keyDirection === key &&
                      cluesLookup[keyDirection][index] === index
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

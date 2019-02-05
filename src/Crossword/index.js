import React, { useEffect, useRef, useReducer } from "react";

import reducer from "./reducer";
import * as utils from "./utils";
import { EVENTS, ACTIONS } from "./constants";

import styles from "./index.module.css";

function App() {
  // Create updaters for all pieces of state
  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    isAcross: true,
    isComplete: false,
    letters: [],
    rows: 0,
    grid: [],
    size: 0,
    direction: "across",
    gridnums: [],
    clues: {
      across: [],
      down: []
    }
  });

  // Set references to all inputs, skip black cells.
  const refs = state.grid.map(letter =>
    !utils.isBlack(letter) ? useRef(null) : null
  );

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/doshea/nyt_crosswords/master/2012/09/12.json"
    )
      .then(resp => resp.json())
      .then(data => dispatch({ type: ACTIONS.SET_CROSSWORD, payload: data }));
  }, []);

  useEffect(() => {
    // Focus on next input if index changes.
    if (refs[state.index] && refs[state.index].current) {
      refs[state.index].current.focus();
    }
  }, [state.index]);

  useEffect(() => {
    window.XW = {
      next: () => dispatch({ type: ACTIONS.GO_NEXT }),
      prev: () => dispatch({ type: ACTIONS.GO_PREV }),
      setAcross: isAcross => {
        dispatch({ type: ACTIONS.SET_ACROSS, payload: { isAcross } });
      },
      setWord: (clue, word) => {
        // TODO, This currently doesn't work for anything after first row.
        // The lookup is slightly backwards.
        const [clueNumStr, clueDirStr] = clue.match(/[a-z]+|[^a-z]+/gi);
        const clueNum = parseInt(clueNumStr);
        const isAcross = clueDirStr === "A" || (state.isAcross && !clueDirStr);
        const indexClue = state.clues[state.direction].findIndex(str => {
          return str.indexOf(`${clueNum}.`) === 0;
        });

        const index = state.cluesLookup[state.direction].indexOf(indexClue);
        if (indexClue === -1) {
          return console.warn("Incorrect clue");
        }

        dispatch({ type: ACTIONS.SET_INDEX, payload: { index } });
        dispatch({ type: ACTIONS.SET_ACROSS, payload: { isAcross } });

        word.split("").forEach(letter => {
          dispatch({
            type: ACTIONS.SET_LETTERS,
            payload: { letter }
          });
          dispatch({ type: ACTIONS.GO_NEXT });
        });
      }
    };
  }, [state.isAcross, state.clues, state.cluesLookup, state.direction]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target.className !== styles.input) {
        return dispatch({ type: ACTIONS.SET_INDEX, payload: { index: -1 } });
      }

      event.preventDefault();

      if (utils.isLetter(event.key) || event.key === EVENTS.Backspace) {
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
        utils.isLetter(event.key)
      ) {
        dispatch({ type: ACTIONS.GO_NEXT });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isAcross]);

  return (
    <main className={styles.main}>
      <section className={styles.crossword} style={{ "--rows": state.size }}>
        {state.grid.map((letter, index) => {
          const number = state.gridnums[index];
          const bgColor = utils.isBlack(letter)
            ? "#000000"
            : index === state.index
            ? "#efefaa"
            : state.cluesLookup[state.direction][index] ===
              state.cluesLookup[state.direction][state.index]
            ? "#B7E2F0"
            : "#ffffff";

          return (
            <div
              key={index}
              className={styles.cell}
              style={{ "--bgcolor": bgColor }}
            >
              {number > 0 && <span className={styles.num}>{number}</span>}
              {!utils.isBlack(letter) && (
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
        <header className={styles.header}>
          <h1 className={styles.title}>Clues</h1>
          <button onClick={() => dispatch({ type: ACTIONS.CHECK_PUZZLE })}>
            Check puzzle
          </button>
        </header>

        {["across", "down"].map(key => (
          <section key={key}>
            <h1 className={styles.title}>{key.toUpperCase()}</h1>
            <ul className={styles.clues}>
              {state.clues[key].map((clue, index) => (
                <li
                  key={clue}
                  className={styles.clue}
                  style={{
                    "--bgcolor":
                      state.direction === key &&
                      state.cluesLookup[state.direction][state.index] === index
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

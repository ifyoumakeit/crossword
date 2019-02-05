import React, { useEffect, useReducer } from "react";

import reducer, { initialState } from "./reducer";
import * as utils from "./utils";
import { EVENTS, ACTIONS, DIRECTIONS } from "./constants";

import styles from "./index.module.css";

function App({ date = "2012/09/12", debug }) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, debug });
  const direction = state.isAcross ? DIRECTIONS.across : DIRECTIONS.down;

  useEffect(() => {
    fetch(
      `https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${date}.json`
    )
      .then(resp => resp.json())
      .then(data => dispatch({ type: ACTIONS.SET_CROSSWORD, payload: data }));
  }, []);

  useEffect(() => {
    window.XW = {
      next: () => dispatch({ type: ACTIONS.GO_NEXT }),
      prev: () => dispatch({ type: ACTIONS.GO_PREV }),
      setAcross: isAcross => {
        dispatch({ type: ACTIONS.SET_ACROSS, payload: isAcross });
      },
      setWord: (clue, word) => {
        // TODO, This currently doesn't work for anything after first row.
        // The lookup is slightly backwards.
        const [clueNumStr, clueDirStr] = clue.match(/[a-z]+|[^a-z]+/gi);
        const clueNum = parseInt(clueNumStr);
        const isAcross = clueDirStr === "A" || (state.isAcross && !clueDirStr);
        const indexClue = state.clues[direction].findIndex(str => {
          return str.indexOf(`${clueNum}.`) === 0;
        });

        const index = state.cluesLookup[direction].indexOf(indexClue);
        if (indexClue === -1) {
          return console.warn("Incorrect clue");
        }

        dispatch({ type: ACTIONS.SET_INDEX, payload: index });
        dispatch({ type: ACTIONS.SET_ACROSS, payload: isAcross });

        word.split("").forEach(letter => {
          dispatch({ type: ACTIONS.SET_LETTERS, payload: letter });
          dispatch({ type: ACTIONS.GO_NEXT });
        });
      }
    };
  }, [state.isAcross, state.clues, state.cluesLookup]);

  useEffect(() => {
    function handleKeyDown(event) {
      event.preventDefault();

      if (utils.isLetter(event.key) || event.key === EVENTS.Backspace) {
        dispatch({
          type: ACTIONS.SET_LETTERS,
          payload: event.key === EVENTS.Backspace ? "" : event.key
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
          payload:
            event.key === EVENTS.ArrowLeft || event.key === EVENTS.ArrowRight
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

      if (event.key === EVENTS.Enter) {
        dispatch({ type: ACTIONS.TOGGLE_ACROSS });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.isAcross]);

  return (
    <main className={styles.main}>
      {state.grid.length > 0 && (
        <section className={styles.crossword} style={{ "--rows": state.size }}>
          {state.grid.map((letter, index) => {
            const number = state.gridnums[index];
            const bgColor = utils.isBlack(letter)
              ? "#000000"
              : index === state.index
              ? "#efefaa"
              : state.cluesLookup[direction][index] ===
                state.cluesLookup[direction][state.index]
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
                    onClick={() =>
                      dispatch({ type: ACTIONS.SET_INDEX, payload: index })
                    }
                  >
                    {state.letters[index]}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}
      <aside className={styles.aside}>
        <header className={styles.header}>
          <h1 className={styles.title}>Clues</h1>
          <button onClick={() => dispatch({ type: ACTIONS.CHECK_PUZZLE })}>
            Check puzzle
          </button>
        </header>

        {[DIRECTIONS.across, DIRECTIONS.down].map(key => (
          <section key={key}>
            <h1 className={styles.title}>{key.toUpperCase()}</h1>
            <ul className={styles.clues}>
              {state.clues[key].map((clue, index) => (
                <li
                  key={clue}
                  className={styles.clue}
                  style={{
                    "--bgcolor":
                      direction === key &&
                      state.cluesLookup[direction][state.index] === index
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
      {state.showCheck && (
        <section className={styles.check}>
          <div className={styles.modal}>
            <h1 className={styles.title}>
              Crossword is {state.isComplete ? "done 🏁" : "unfinished"}
            </h1>
            <button onClick={() => dispatch({ type: ACTIONS.HIDE_CHECK })}>
              Close
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;

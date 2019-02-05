import { BLANK_CHAR, ACTIONS } from "./constants";
import getCluesLookup from "./get_clues_lookup";

function getNextIndex(index = 0, grid = [], adder = 0) {
  const indexNext = index + adder;
  const cellNext = grid[indexNext];

  if (cellNext) {
    if (cellNext === BLANK_CHAR) {
      return getNextIndex(indexNext, grid, adder);
    }
    return indexNext;
  }

  return index;
}

export default function reducer(state, action = {}) {
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
        direction: isAcross ? "across" : "down",
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
          state.isAcross ? 1 : state.size
        )
      };
    }
    case ACTIONS.GO_PREV: {
      return {
        ...state,
        index: getNextIndex(
          state.index,
          state.grid,
          state.isAcross ? -1 : -state.size
        )
      };
    }
    case ACTIONS.SET_CROSSWORD: {
      return {
        ...state,
        grid: action.payload.grid,
        clues: action.payload.clues,
        gridnums: action.payload.gridnums,
        letters: action.payload.grid.map(() => ""),
        size: action.payload.size.cols,
        cluesLookup: getCluesLookup(
          action.payload.grid,
          action.payload.size.cols
        )
      };
    }
    case ACTIONS.CHECK_PUZZLE: {
      return {
        ...state,
        isComplete: state.grid.every(
          (letter, index) => state.letters[index] === letter
        )
      };
    }
    default: {
      return state;
    }
  }
}

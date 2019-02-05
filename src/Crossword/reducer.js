import { BLANK_CHAR, ACTIONS, DIRECTIONS } from "./constants";
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

export const initialState = {
  debug: false,
  index: 0,
  isAcross: true,
  isComplete: false,
  letters: [],
  rows: 0,
  grid: [],
  size: 0,
  showCheck: false,
  direction: DIRECTIONS.across,
  gridnums: [],
  clues: {
    across: [],
    down: []
  }
};

export default function reducer(state, action = {}) {
  state.debug && console.log(action);
  switch (action.type) {
    case ACTIONS.SET_LETTERS: {
      return {
        ...state,
        letters: [
          ...state.letters.slice(0, state.index),
          action.payload.toUpperCase(),
          ...state.letters.slice(state.index + 1)
        ]
      };
    }
    case ACTIONS.SET_ACROSS: {
      return { ...state, isAcross: !!action.payload };
    }
    case ACTIONS.TOGGLE_ACROSS: {
      return { ...state, isAcross: !state.isAcross };
    }
    case ACTIONS.SET_INDEX: {
      return {
        ...state,
        index: action.payload,
        isAcross:
          action.payload === state.index ? !state.isAcross : state.isAcross
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
        showCheck: true,
        isComplete: state.grid.every(
          (letter, index) => state.letters[index] === letter
        )
      };
    }
    case ACTIONS.HIDE_CHECK: {
      return {
        ...state,
        showCheck: false
      };
    }
    default: {
      return state;
    }
  }
}

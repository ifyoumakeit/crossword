import { BLANK_CHAR, ACTIONS } from "./constants";

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
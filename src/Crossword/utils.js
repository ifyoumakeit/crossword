import { BLANK_CHAR } from "./constants";

export function isBlack(val) {
  return val === BLANK_CHAR;
}

export function isLetter(val) {
  return /^[a-zA-Z]$/.test(val);
}

export function getNextLookup(grid = [], rows = 0) {
  return function getNextIndex(index = 0, isAcross = true, isNext = true) {
    const sign = isNext ? 1 : -1;
    const value = isAcross ? 1 : rows;
    const indexNext = index + sign * value;
    const cellNext = grid[indexNext];

    if (cellNext) {
      if (cellNext === BLANK_CHAR) {
        return getNextIndex(indexNext, isAcross, isNext);
      }
      return indexNext;
    }

    return index;
  };
}

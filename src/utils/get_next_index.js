import { BLANK_CHAR } from "../constants";

export default function getNextIndex(index = 0, grid = [], adder = 0) {
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

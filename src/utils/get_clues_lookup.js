import { BLANK_NUMBER, BLANK_CHAR } from "../constants";

export default function getCluesLookup(grid = [], cols = 0) {
  return {
    across: grid.reduce((acc, letter, index) => {
      if (letter === ".") {
        return acc.concat(BLANK_NUMBER);
      }

      function isValid(value, index) {
        return value !== BLANK_NUMBER && index % cols !== 0;
      }

      const last = acc[index - 1];
      if (isValid(last, index)) {
        return acc.concat(last);
      }

      const lastNum = acc
        .slice(0)
        .reverse()
        .find(isValid);

      return acc.concat(isNaN(lastNum) ? 0 : lastNum + 1);
    }, []),
    down: grid.reduce(
      (acc, letter, index) => {
        if (letter === BLANK_CHAR) {
          return {
            ...acc,
            down: acc.down.concat(BLANK_NUMBER)
          };
        }

        const lastNum = acc.down[index - cols];
        const shouldUpdate = lastNum === BLANK_NUMBER || lastNum === undefined;
        const count = shouldUpdate ? acc.count + 1 : acc.count;

        return {
          count,
          down: acc.down.concat(shouldUpdate ? count : lastNum)
        };
      },
      { down: [], count: -1 }
    ).down
  };
}

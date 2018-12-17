import { BLANK_NUMBER } from "../constants";

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
        if (letter === ".") {
          return {
            count: acc.count,
            down: acc.down.concat(BLANK_NUMBER)
          };
        }

        const col = index % cols;
        const lastNum = acc.down
          .slice(0)
          .reverse()
          .find(function isValid(value, index, arr) {
            return (
              value !== BLANK_NUMBER && (arr.length - 1 - index) % cols === col
            );
          });

        const count = lastNum > BLANK_NUMBER ? lastNum : acc.count + 1;

        return {
          count,
          down: acc.down.concat(count)
        };
      },
      { down: [], count: -1 }
    ).down
  };
}

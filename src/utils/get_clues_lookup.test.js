import getCluesLookup from "./get_clues_lookup";

describe("getCluesLookup", () => {
  const cluesLookup = getCluesLookup(
    [
      ...".CROW".split(""),
      ...".HASH".split(""),
      ..."NANCY".split(""),
      ..."YOGA.".split(""),
      ..."USER.".split("")
    ],
    5
  );

  it("should return across", () => {
    expect(cluesLookup.across).toEqual([
      ...[-1, 0, 0, 0, 0],
      ...[-1, 1, 1, 1, 1],
      ...[2, 2, 2, 2, 2],
      ...[3, 3, 3, 3, -1],
      ...[4, 4, 4, 4, -1]
    ]);
  });

  it("should return down", () => {
    expect(cluesLookup.down).toEqual([
      ...[-1, 0, 1, 2, 3],
      ...[-1, 0, 1, 2, 3],
      ...[4, 0, 1, 2, 3],
      ...[4, 0, 1, 2, -1],
      ...[4, 0, 1, 2, -1]
    ]);
  });
});

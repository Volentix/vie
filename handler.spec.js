const { telegram } = require("./handler");

describe("telegram", () => {
  test("the telegram function should work", async () => {
    return await expect(
      telegram({ body: JSON.stringify({ message: {} }) }, {})
    ).resolves.toBeDefined();
  });

  test("the telegram function should be successful", async () => {
    return await expect(
      telegram({ body: JSON.stringify({ message: {} }) }, {})
    ).resolves.toEqual({
      statusCode: 200
    });
  });
});

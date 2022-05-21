const { encode } = require("./url");

test("encode: README", () => {
  expect(encode({ a: 1, b: 2 })).toBe("a=1&b=2");

  expect(encode({ a: [1, 2] })).toBe("a=1&a=2");
  expect(encode({ a: [1, 2] }, { listBracket: true })).toBe(
    "a%5B%5D=1&a%5B%5D=2"
  );

  expect(encode({ a: { b: [1, 2] } })).toBe("a.b=1&a.b=2");
  expect(encode({ a: [{ b: 1 }, { b: 2 }] })).toBe("a.b=1&a.b=2");
  expect(encode({ a: { b: [1, 2] } }, { listBracket: true })).toBe(
    "a.b%5B%5D=1&a.b%5B%5D=2"
  );
  expect(encode({ a: [{ b: 1 }, { b: 2 }] }, { listBracket: true })).toBe(
    "a%5B%5D.b=1&a%5B%5D.b=2"
  );

  expect(encode({ a: [1, 2] }, { listIndex: true })).toBe(
    "a%5B0%5D=1&a%5B1%5D=2"
  );

  expect(encode({ a: { b: [1, { c: 2 }] } })).toBe("a.b=1&a.b.c=2");
  expect(encode({ a: { b: [1, { c: 2 }] } }, { listBracket: true })).toBe(
    "a.b%5B%5D=1&a.b%5B%5D.c=2"
  );

  expect(encode({ a: { b: 1 } })).toBe("a.b=1");
  expect(encode({ a: { b: 1 } }, { objBracket: true })).toBe("a%5Bb%5D=1");

  expect(encode({ b: 1, a: 1 }, { sort: true })).toBe("a=1&b=1");

  expect(encode({ a: "", b: null })).toBe("a=&b=null");
  expect(encode({ a: "", b: null }, { drop: ["", null] })).toBe("");
});

test("encode: any invalid/empty value returns an empty string", () => {
  expect(encode()).toBe("");
  expect(encode(undefined)).toBe("");
  expect(encode(null)).toBe("");
  expect(encode(3)).toBe("");
  expect(encode(true)).toBe("");
  expect(encode({})).toBe("");
});

test("encode: unicode and special characters are OK", () => {
  expect(encode({ 高: "σ", λ: "►" })).toBe("%E9%AB%98=%CF%83&%CE%BB=%E2%96%BA");
  expect(encode({ '#;,/ ?:@&=+$"': "-_.!~*'()" })).toBe(
    "%23%3B%2C%2F%20%3F%3A%40%26%3D%2B%24%22=-_.!~*'()"
  );
});

test("encode: complex encodings", () => {
  expect(encode({ a: { b: [1, { c: { d: 2 } }, 3, { c: { d: 4 } }] } })).toBe(
    "a.b=1&a.b.c.d=2&a.b=3&a.b.c.d=4"
  );
  expect(
    encode(
      { a: { b: [1, { c: { d: 2 } }, 3, { c: { d: 4 } }] } },
      { listIndex: true }
    )
  ).toBe("a.b%5B0%5D=1&a.b%5B1%5D.c.d=2&a.b%5B2%5D=3&a.b%5B3%5D.c.d=4");
});

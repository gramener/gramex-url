const { encode, decode } = require("./url");

test("encode: README", () => {
  expect(encode({ a: [1, 2] })).toBe("a=1&a=2");
  expect(encode({ a: [1, 2] }, { listBracket: true })).toBe(
    "a%5B%5D=1&a%5B%5D=2"
  );
  expect(encode({ a: [1, 2] })).toBe("a=1&a=2");
  expect(encode({ a: [1, 2] }, { listIndex: true })).toBe(
    "a%5B0%5D=1&a%5B1%5D=2"
  );
  expect(encode({ a: { b: 1 } })).toBe("a.b=1");
  expect(encode({ a: { b: 1 } }, { objBracket: true })).toBe("a%5Bb%5D=1");
  expect(encode({ b: 2, a: 1 })).toBe("b=2&a=1");
  expect(encode({ b: 2, a: 1 }, { sort: true })).toBe("a=1&b=2");
  expect(encode({ a: "", b: null })).toBe("a=&b=null");
  expect(encode({ a: "", b: null }, { drop: ["", null] })).toBe("");

  expect(encode({ a: { b: [1, 2] } })).toBe("a.b=1&a.b=2");
  expect(encode({ a: [{ b: 1 }, { b: 2 }] })).toBe("a.b=1&a.b=2");
  expect(encode({ a: { b: [1, 2] } }, { listBracket: true })).toBe(
    "a.b%5B%5D=1&a.b%5B%5D=2"
  );
  expect(encode({ a: [{ b: 1 }, { b: 2 }] }, { listBracket: true })).toBe(
    "a%5B%5D.b=1&a%5B%5D.b=2"
  );

  expect(encode({ a: { b: [1, { c: 2 }] } })).toBe("a.b=1&a.b.c=2");
  expect(encode({ a: { b: [1, { c: 2 }] } }, { listBracket: true })).toBe(
    "a.b%5B%5D=1&a.b%5B%5D.c=2"
  );
});

test("encode: empty/invalid values", () => {
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

test("encode: complex scenarios", () => {
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

test("decode: README", () => {
  expect(decode("a=1e2&b=true&c=null&d=x")).toEqual({
    a: "1e2",
    b: "true",
    c: "null",
    d: "x",
  });
  expect(decode("a=1e2&b=true&c=null&d=x", { convert: true })).toEqual({
    a: 100,
    b: true,
    c: null,
    d: "x",
  });
  expect(decode("a=1")).toEqual({ a: "1" });
  expect(decode("a=1", { forceList: true })).toEqual({ a: ["1"] });
  expect(decode("a=")).toEqual({ a: "" });
  expect(decode("a=", { drop: [""] })).toEqual({});

  expect(decode("a.b=1&a.c=2")).toEqual({ a: { b: "1", c: "2" } });
  expect(decode("a.b=1&a[c]=2")).toEqual({ a: { b: "1", c: "2" } });
  expect(decode("a.b=1&a[]=2")).toEqual({ a: [{ b: "1" }, "2"] });
  expect(decode("a[2]=1&a[1]=2")).toEqual({ a: [undefined, "2", "1"] });
  expect(decode("a[]=1&b[]=2")).toEqual({ a: ["1"], b: ["2"] });
  expect(decode("a.b[]=1&a.b[]=2")).toEqual({ a: { b: ["1", "2"] } });
});

test("decode: empty/invalid values", () => {
  expect(decode()).toEqual({});
  expect(decode(undefined)).toEqual({});
  expect(decode(null)).toEqual({});
  expect(decode({})).toEqual({});
  expect(decode("")).toEqual({});
});

test("decode: unicode and special characters are OK", () => {
  expect(decode("%E9%AB%98=%CF%83&%CE%BB=%E2%96%BA")).toEqual({
    高: "σ",
    λ: "►",
  });
  expect(decode("%23%3B%2C%2F%20%3F%3A%40%26%3D%2B%24%22=-_.!~*'()")).toEqual({
    '#;,/ ?:@&=+$"': "-_.!~*'()",
  });
});

test("decode: complex scenarios", () => {
  expect(decode("a=1&a=2")).toEqual({ a: ["1", "2"] });
  expect(decode("a.b=1&a.b=2")).toEqual({ a: { b: ["1", "2"] } });
  expect(decode("a[b]=1&a[b]=2")).toEqual({ a: { b: ["1", "2"] } });

  expect(decode(".a.b=1&.a[b]=2")).toEqual({ a: { b: ["1", "2"] } });
  expect(decode("a=1&a.b=2")).toEqual({ a: ["1", { b: "2" }] });
  expect(decode("a=1&a.b=2&a.b.c=3")).toEqual({
    a: ["1", { b: "2" }, { b: { c: "3" } }],
  });

  expect(decode("a[0]=1&a[1]=2")).toEqual({ a: ["1", "2"] });
  expect(decode("a[0]=1&a[1]=2&a[2]=3")).toEqual({ a: ["1", "2", "3"] });

  expect(decode("a[0]=1&a[1].b[0]=2&a[1].b[1].c=3")).toEqual({
    a: ["1", { b: ["2", { c: "3" }] }],
  });
});

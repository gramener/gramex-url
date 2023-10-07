import { decode } from "../dist/url.js";

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
  expect(decode("a=", { pruneString: true })).toEqual({});

  expect(decode("a.b=1&a.c=2")).toEqual({ a: { b: "1", c: "2" } });
  expect(decode("a.b=1&a[]=2")).toEqual({ a: [{ b: "1" }, "2"] });
  expect(decode(`a=2&a[]=3`)).toEqual({ a: ["2", "3"] });
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

  expect(decode("a=1&a.b=2")).toEqual({ a: { 1: "1", b: "2" } });
  expect(decode("a=1&a.b=2&a.b.c=3")).toEqual({ a: { 1: "1", b: { 2: "2", c: "3" } } });

  expect(decode("a[]=1&a[]=2")).toEqual({ a: ["1", "2"] });
  expect(decode("a[]=1&a[]=2&a[]=3")).toEqual({ a: ["1", "2", "3"] });
});

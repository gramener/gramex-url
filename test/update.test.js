import { update } from "../dist/url.js";

test("update: README", () => {
  expect(update({}, "a=1e2&b=true&c=null&d=x")).toEqual({
    a: "1e2",
    b: "true",
    c: "null",
    d: "x",
  });
  expect(update({}, "a=1e2&b=true&c=null&d=x", { convert: true })).toEqual({
    a: 100,
    b: true,
    c: null,
    d: "x",
  });
  expect(update({}, "a=1")).toEqual({ a: "1" });
  expect(update({}, "a=1", { forceList: true })).toEqual({ a: ["1"] });
  expect(update({}, "a=")).toEqual({ a: "" });
  expect(update({}, "a=", { pruneString: true })).toEqual({});

  expect(update({}, "a.b=1&a.c=2")).toEqual({ a: { b: "1", c: "2" } });
  expect(update({}, "a.b=1&a[]=2")).toEqual({ a: [{ b: "1" }, "2"] });
  expect(update({}, `a=2&a[]=3`)).toEqual({ a: ["2", "3"] });
  expect(update({}, "a[]=1&b[]=2")).toEqual({ a: ["1"], b: ["2"] });
  expect(update({}, "a.b[]=1&a.b[]=2")).toEqual({ a: { b: ["1", "2"] } });
});

test("update: code path coverage", () => {
  // Test cases based on the documentation:

  // 1. `a=1` sets `object.a` to `1`
  expect(update({ a: "0" }, "a=1")).toEqual({ a: "1" });
  expect(update({ a: ["0", "1"] }, "a=1&a=2")).toEqual({ a: ["0", "1", "1", "2"] });

  // 2. `a[]=1` forces `object.a` into a list and appends `1` to it.
  expect(update({}, "a[]=1")).toEqual({ a: ["1"] });
  expect(update({ a: "0" }, "a[]=1")).toEqual({ a: ["0", "1"] });

  // 3. `a.b=1` forces `object.a` into an object and sets `object.a.b` to `1`
  expect(update({}, "a.b=1")).toEqual({ a: { b: "1" } });
  expect(update({ a: "0" }, "a.b=1")).toEqual({ a: { 0: "0", b: "1" } });
  expect(update({ a: { b: "0" } }, "a.b=1")).toEqual({ a: { b: "1" } });

  // 4. `a.b[]=1` forces `object.a.b` into a list and appends `1`
  expect(update({}, "a.b[]=1")).toEqual({ a: { b: ["1"] } });
  expect(update({ a: "1" }, "a.b[]=2")).toEqual({ a: { 1: "1", b: ["2"] } });
  expect(update({}, "a.b=1&a[]=2")).toEqual({ a: [{ b: "1" }, "2"] });

  // 5. `a-=` removes `object.a`
  expect(update({ a: "1" }, "a-=")).toEqual({});
  expect(update({ a: ["0", "1"] }, "a-=")).toEqual({});

  // 6. `a-=1` removes `1` from `object.a`
  expect(update({ a: "1" }, "a-=1")).toEqual({});
  expect(update({ a: ["0", "1"] }, "a-=1")).toEqual({ a: ["0"] });

  // 7. `a~=1` toggles `1` in `object.a`
  expect(update({ a: "0" }, "a~=1")).toEqual({ a: ["0", "1"] });
  expect(update({ a: "1" }, "a~=1")).toEqual({});
  expect(update({ a: ["1"] }, "a~=1", { drop: [] })).toEqual({});
  expect(update({ a: ["0", "1"] }, "a~=1")).toEqual({ a: ["0"] });

  // 8. `settings` tests
  expect(update({ a: 100, b: true }, "a-=1e2&b-=true")).toEqual({ a: 100, b: true });
  expect(update({ a: 100, b: true }, "a-=1e2&b-=true", { convert: true })).toEqual({});
  expect(update({}, "a=1")).toEqual({ a: "1" });
  expect(update({}, "a=1", { forceList: true })).toEqual({ a: ["1"] });
  expect(update({ a: "" }, "b=")).toEqual({ a: "", b: "" });
  expect(update({ a: "" }, "b=", { pruneString: true })).toEqual({});
  expect(update({ a: {} }, "b=2")).toEqual({ b: "2" });
  expect(update({ a: {} }, "b=2", { pruneObject: false })).toEqual({ a: {}, b: "2" });
  expect(update({ a: [] }, "b=2")).toEqual({ b: "2" });
  expect(update({ a: [] }, "b=2", { pruneArray: false })).toEqual({ a: [], b: "2" });

  // Additional test cases to cover every possible scenario:

  // 9. Unicode characters
  expect(update({}, "a=😀")).toEqual({ a: "😀" });
  expect(update({}, "a[]=😀&a[]=😁")).toEqual({ a: ["😀", "😁"] });

  // 10. Nested objects and arrays
  expect(update({ a: { b: ["0", "1"], c: "2" } }, "a.b[]=3&a.c=4")).toEqual({ a: { b: ["0", "1", "3"], c: "4" } });
  expect(update({ a: { b: ["0", "1"], c: "2" } }, "a.b-=1&a.c=3")).toEqual({ a: { b: ["0"], c: "3" } });

  // 11. Multiple operations
  expect(update({ a: "0", b: ["1", "2"], c: { d: "3" } }, "a=1&b-=2&c.d=4")).toEqual({
    a: "1",
    b: ["1"],
    c: { d: "4" },
  });

  // 12. Complex scenarios
  expect(update({ a: "0", b: ["1", "2"], c: { d: "3" } }, "a.b=1&a.c=2&b[]=3&c.d=4")).toEqual({
    a: { b: "1", c: "2", 0: "0" },
    b: ["1", "2", "3"],
    c: { d: "4" },
  });
});

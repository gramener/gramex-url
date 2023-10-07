# @gramex/url

**url** encodes/decodes objects into [form-urlencoded query strings](https://url.spec.whatwg.org/#concept-urlencoded). For example:

```js
encode({ a: 1, b: [2, 3] }); // "a=1&b=2&b=3"
decode("a=1&b=2&b=3"); // {a: "1", b: ["2", "3"]}
update({ a: 2 }, "a=&b=3"); // {b: "3"}
```

## Alternatives

This library focuses on 3 features:

- Type conversion, e.g. `?a=1` becomes `{'a': 1}` instead of `{'a': '1'}`
- Array values, e.g. `?a=1&a=2` becomes `{'a': [1, 2]}`
- Nested keys, e.g. `?a.b=1` becomes `{'a': {'b': 1}}`

Use the FIRST alternative below that meets your need:

| Alternatives        | Type conversion | Array values | Nested keys | Why?                   |
| ------------------- | :-------------: | :----------: | :---------: | ---------------------- |
| [URLSearchParams][] |       No        |      No      |     Yes     | Native browser feature |
| [query-string][]    |       Yes       |     Yes      | [No][nest]  | Lightweight ES Module  |
| [qs][]              |   [No][type]    |     Yes      |     Yes     | Most popular library   |
| [@gramex/url][]     |       Yes       |     Yes      |     Yes     | Has all features above |

[URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[query-string]: https://www.npmjs.com/package/query-string
[qs]: https://www.npmjs.com/package/qs
[@gramex/url]: https://www.npmjs.com/package/@gramex/url
[nest]: https://www.npmjs.com/package/query-string#user-content-nesting
[type]: https://github.com/ljharb/qs/issues/91

## Installation

Install via `npm`:

```bash
npm install @gramex/url
```

Use locally as an ES module:

```html
<script type="module">
  import { encode, decode, update } from "./node_modules/@gramex/url/dist/url.js";
</script>
```

Use locally as a script:

```html
<script src="./node_modules/@gramex/url/dist/network.min.js"></script>
<script>
  gramex.url.encode(...)
  gramex.url.decode(...)
  gramex.url.update(...)
</script>
```

Use via CDN as an ES Module:

```html
<script type="module">
  import { encode, decode, update } from "https://cdn.jsdelivr.net/npm/@gramex/url@2";
</script>
```

Use via CDN as a script:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/url@1/dist/url.min.js"></script>
<script>
  gramex.url.encode(...)
  gramex.url.decode(...)
  gramex.url.update(...)
</script>
```

## encode

`encode(object, [settings])` encodes object into a [form-urlencoded query string](https://url.spec.whatwg.org/#concept-urlencoded).

`object` is any JSON serializable object.

`settings` is an optional object with the following properties:

- `listBracket`: appends `[]` to arrays. Default: `false`
  - `encode({a: [1, 2]})` ➜ `"a=1&a=2"`
  - `encode({a: [1, 2]}, {listBracket: true})` ➜ `"a[]=1&a[]=2"`
- `listIndex`: appends `[0]`, `[1]`, ... to arrays. Overrides `listBracket`. Default: `false`
  - `encode({a: [1, 2]})` ➜ `"a=1&a=2"`
  - `encode({a: [1, 2]}, {listIndex: true})` ➜ `"a[0]=1&a[1]=2`",
- `objBracket`: uses `[key]` instead of `.key`. Default: `false`
  - `encode({a: {b: 1}})` ➜ `"a.b=1"`
  - `encode({a: {b: 1}}, {objBracket: true})` ➜ `"a[b]=1"`
- `sortKeys`: sorts keys. Default: `false`
  - `encode({b: 2, a: 1})` ➜ `"b=2&a=1"`
  - `encode({b: 2, a: 1}, {sortKeys: true})` ➜ `"a=1&b=2"`
- `drop`: list of values to drop. Default: `[]`
  - `encode({a: "", b: null})` ➜ `"a=&b=null"`
  - `encode({a: "", b: null}, {drop: ["", null]})` ➜ `""`

More examples:

```js
encode({ a: { b: [1, 2] } }); // "a.b=1&a.b=2"
encode({ a: [{ b: 1 }, { b: 2 }] }); // "a.b=1&a.b=2" -- same as above!
encode({ a: { b: [1, 2] } }, { listBracket: true }); // "a.b[]=1&a.b[]=2"
encode({ a: [{ b: 1 }, { b: 2 }] }, { listBracket: true }); // "a[].b=1&a[].b=2"

encode({ a: { b: [1, { c: 2 }] } }); // "a.b=1&a.b.c=2"
encode({ a: { b: [1, { c: 2 }] } }, { listBracket: true }); // "a.b[]=1&a.b[].c=2"
```

## decode

`decode(url, [settings])` decodes a [form-urlencoded query string](https://url.spec.whatwg.org/#concept-urlencoded) into an object

`url` is any URL query string.

`settings` is an optional object with the following properties:

- `convert`: converts numbers, boolean, null and undefined into native JavaScript. Default: `false`
  - `decode("a=1e2&b=true&c=null&d=x")` ➜ `{a: "1e2", b: "true", c: "null", d: "x"}`
  - `decode("a=1e2&b=true&c=null&d=x", {convert: true})` ➜ `{a: 100, b: true, c: null, d: "x"}`
- `forceList`: _always_ saves values as arrays. Default: `false`
  - `decode("a=1")` ➜ `{a: 1}`
  - `decode("a=1", {forceList: true})` ➜ `{a: [1]}`,
- `pruneString`: removes empty strings. Default: `false`
  - `decode("a=")` ➜ `{a: ""}`
  - `decode("a=", {pruneString: true})` ➜ `{}`

Notes:

- If a key ends with `[]` (e.g. `a[]=1`) it is converted to an array (like `forceList`) and values are appended.
- If a key has a `.` (e.g. `a.b=1`) it is converted to an object and sub-keys are nested.

More examples:

```js
decode("a.b=1&a.c=2"); // {a: {b: "1", c: "2"}}
decode("a.b=1&a[c]=2"); // {a: {b: "1", c: "2"}}
decode("a.b=1&a[]=2"); // {a: [{b: "1"}, "2"]}
decode(`a=2&a[]=3`); // `{"a": ["2", "3"]}`
decode("a[]=1&a[]=2"); // {a: ["1", "2"]}
decode("a[]=1&b[]=2"); // {a: ["1"], b: ["2"]}
decode("a.b[]=1&a.b[]=2"); // {a: {b: ["1", "2"]}}
```

## update

`update(object, url, [settings])` updates an object with a [form-urlencoded query string](https://url.spec.whatwg.org/#concept-urlencoded).

`object` is any JSON serializable object.

`url` is any URL query string. It uses the following conventions:

- `a=1` sets `object.a` to `1`
  - `update({a: "0"}, "a=1")` ➜ `{a: "1"}`
  - `update({a: ["0", "1"]}, "a=1&a=2")` ➜ `{a: ["1", "2"]}`
- `a[]=1` forces `object.a` into a list and appends `1` to it.
  - `update({}, "a[]=1")` ➜ `{a: "1"}` (since `forceList` defaults to `false``)
  - `update({a: "0"}, "a[]=1")` ➜ `{a: ["0", "1"]}`
- `a.b=1` forces `object.a` into an object (`{val: val}` if the value is a scalar) and sets `object.a.b` to `1`
  - `update({}, "a.b=1")` ➜ `{a: {b: "1"}}`
  - `update({a: "0"}, "a.b=1")` ➜ `{a: {"0": "0", b: "1"}}`
  - `update({a: {b: "0"}}, "a.b=1")` ➜ `{a: {b: "1"}}`
- `a.b[]=1` forces `object.a.b` into a list (e.g. `[val]`) and appends `1`
  - `update({}, "a.b[]=1")` ➜ `{a: {b: "1"}}` (since `forceList` defaults to `false``)
  - `update({a: "1"}, "a.b[]=2")` ➜ `{a: {"1": "1", b: ["2"]}}`
  - `update({}, "a.b=1&a[]=2")` ➜ `{ a: [{ b: "1" }, "2"] }`
- `a-=` removes `object.a`
  - `update({a: "1"}, "a-=")` ➜ `{}`
  - `update({a: ["0", "1"]}, "a-=")` ➜ `{}`
- `a-=1` removes `1` from `object.a`
  - `update({a: "1"}, "a-=1")` ➜ `{}`
  - `update({a: ["0", "1"]}, "a-=1")` ➜ `{a: ["0"]}`
- `a~=1` toggles `1` in `object.a`
  - `update({a: "0"}, "a~=1")` ➜ `{a: ["0", "1"]}`
  - `update({a: "1"}, "a~=1")` ➜ `{}`
  - `update({a: ["1"]}, "a~=1", {drop: []})` ➜ `{a: []}`
  - `update({a: ["0", "1"]}, "a~=1")` ➜ `{a: ["0"]}`

`settings` is an optional object with the following properties:

- `convert`: converts numbers, boolean, null and undefined into native JavaScript. Default: `false`
  - `update({a: 100, b: true}, "a-=1e2&b=true")` ➜ `{a: 100, b: true}`
  - `update({a: 100, b: true}, "a-=1e2&b=true", {convert: true})` ➜ `{}`
- `forceList`: _always_ saves values as arrays. Default: `false`
  - `update({}, "a=1")` ➜ `{a: 1}`
  - `update({}, "a=1", {forceList: true})` ➜ `{a: [1]}`,
- `pruneString`: removes empty strings. Default: `false`
  - `update({"a": ""}, "b=")` ➜ `{a: "", b: ""}`
  - `update({"a": ""}, "b=", {pruneString: true})` ➜ `{}`
- `pruneObject`: removes empty objects. Default: `true`
  - `update({"a": {}}, "b=2")` ➜ `{b: 2}`
  - `update({"a": {}}, "b=2", {pruneObject: true})` ➜ `{a: {}, b: 2}`
- `pruneArray`: removes empty arrays. Default: `true`
  - `update({"a": []}, "b=2")` ➜ `{b: 2}`
  - `update({"a": []}, "b=2", {pruneArray: true})` ➜ `{a: [], b: 2}`

<!-- Avoid JSON.parse. Use URLSearchParams. Use switch. Write compact code. -->

More examples:

```js
update({ a: 1 }, "a.b=2"); // {a: [1, {b: "2"}]}
update({ a: { b: "1" } }, "a.b-=1"); // {}
```

## Release notes

- 2.0.0: 7 Oct 2023. `update()` implemented
  - Breaking change: `decode({drop})` is not supported. Use `decode({pruneString, pruneObject, pruneArray})` instead.
- 1.1.0: 22 May 2022. `decode()` implemented
- 1.0.0: 21 May 2023. `encode()` implemented

## Authors

Anand S <s.anand@gramener.com>

## License

[MIT](https://spdx.org/licenses/MIT.html)

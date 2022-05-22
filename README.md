# @gramex/url

**url** encodes/decodes objects into [form-urlencoded query strings](https://url.spec.whatwg.org/#concept-urlencoded). For example:

```js
encode({a: 1, b: [2, 3]})  // 'a=1&b=2&b=3'
decode('a=1&b=2&b=3')      // {a: '1', b: ['2', '3']}
```

## Installation

- Via npm for Node.js: `npm install @gramex/url`
- Via CDN for browser: `<script src="https://cdn.jsdelivr.net/npm/@gramex/url/url.min.js">`

## Usage

On Node.js:

```js
import { encode, decode } from '@gramex/url'

const url = encode({a: 1, b: [2, 3]})
const obj = decode(url)
```

On the browser:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/url/url.min.js"><script>
<script>
const url = gramex.url.encode({a: 1, b: [2, 3]})
const obj = gramex.url.decode(url)
</script>
```

## encode

`encode(object, [settings])` encodes object into a [form-urlencoded query strings](https://url.spec.whatwg.org/#concept-urlencoded).

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
- `sort`: sorts keys. Default: `false`
  - `encode({b: 2, a: 1})` ➜ `"b=2&a=1"`
  - `encode({b: 2, a: 1}, {sort: true})` ➜ `"a=1&b=2"`
- `drop`: list of values to drop. Default: `[]`
  - `encode({a: '', b: null})` ➜ `"a=&b=null"`
  - `encode({a: '', b: null}, {drop: ['', null]})` ➜ `""`

More examples:

```js
encode({a: {b: [1, 2]}})                  // 'a.b=1&a.b=2'
encode({a: [{b: 1}, {b: 2}]})             // 'a.b=1&a.b=2' -- same as above!
encode({a: {b: [1, 2]}}, {listBracket: true})       // 'a.b[]=1&a.b[]=2'
encode({a: [{b: 1}, {b: 2}]}, {listBracket: true})  // 'a[].b=1&a[].b=2'

encode({a: {b: [1, {c: 2}]}})                       // 'a.b=1&a.b.c=2'
encode({a: {b: [1, {c: 2}]}}, {listBracket: true})  // 'a.b[]=1&a.b[].c=2'
```

## decode

`decode(url, [settings])` decodes a [form-urlencoded query strings](https://url.spec.whatwg.org/#concept-urlencoded) into an object

`url` is any URL query string.

`settings` is an optional object with the following properties:

- `convert`: converts numbers, boolean, null and undefined into native JavaScript. Default: `false`
  - `decode('a=1e2&b=true&c=null&d=x')` ➜ `{a: '1e2', b: 'true', c: 'null', d: 'x'}`
  - `decode('a=1e2&b=true&c=null&d=x', {convert: true})` ➜ `{a: 100, b: true, c: null, d: 'x'}`
- `forceList`: *always* saves values as arrays. Default: `false`
  - `decode('a=1')` ➜ `{a: 1}`
  - `decode('a=1')` ➜ `{a: [1]}`,
- `drop`: list of values to drop. Default: `[]`
  - `decode('a=')` ➜ `{a: ''}`
  - `decode('a=', {drop: ['']})` ➜ `{}`

More examples:

```js
decode('a.b=1&a.c=2')         // {a: {b: '1', c: '2'}}
decode('a.b=1&a[c]=2')        // {a: {b: '1', c: '2'}}
decode('a.b=1&a[]=2')         // {a: [{b: '1'}, '2']}
decode('a[2]=1&a[1]=2')       // {a: [undefined, '2', '1']}
decode("a[]=1&b[]=2")         // {a: ["1"], b: ["2"]}
decode("a.b[]=1&a.b[]=2")     // {a: {b: ["1", "2"]}}
```

## License

[MIT License](https://opensource.org/licenses/MIT)

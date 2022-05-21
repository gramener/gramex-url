# @gramex/url

**url** encodes any JSON object into a [form-urlencoded string](https://url.spec.whatwg.org/#concept-urlencoded) and decodes them. For example:

```js
url.encode({a: 1, b: 2})                      // 'a=1&b=2'

url.encode({a: [1, 2]})                       // 'a=1&a=2'
url.encode({a: [1, 2]}, {listBracket: true})  // 'a[]=1&a[]=2'

url.encode({a: {b: [1, 2]}})                  // 'a.b=1&a.b=2'
url.encode({a: [{b: 1}, {b: 2}]})             // 'a.b=1&a.b=2' -- same as above!
url.encode({a: {b: [1, 2]}}, {listBracket: true})       // 'a.b[]=1&a.b[]=2'
url.encode({a: [{b: 1}, {b: 2}]}, {listBracket: true})  // 'a[].b=1&a[].b=2'

url.encode({a: [1, 2]}, {listIndex})                    // 'a[0]=1&a[1]=2'

url.encode({a: {b: [1, {c: 2}]}})                       // 'a.b=1&a.b.c=2'
url.encode({a: {b: [1, {c: 2}]}}, {listBracket: true})  // 'a.b[]=1&a.b[].c=2'

url.encode({a: {b: 1}})                       // 'a.b=1'
url.encode({a: {b: 1}}, {objBracket: true})   // 'a[b]=1'

url.encode({b: 1, a: 1}, {sort: true})        // 'a=1&b=1' -- sorts object keys

url.encode({a: '', c: null})                      // 'a=&b=null'
url.encode({a: '', c: null}, {drop=['', null]})   // ''
```

## Installation

- Via npm for Node.js: `npm install @gramex/url`
- Via CDN for browser: `<script src="https://cdn.jsdelivr.net/npm/@gramex/url/url.min.js">`

## Usage

On Node.js:

```js
import { encode } from '@gramex/url'

const url = encode({a: 1, b: 2})
```

On the browser:

```html
<script src="https://cdn.jsdelivr.net/npm/@gramex/url/url.min.js"><script>
<script>
const url = gramex.url.encode({a: 1, b: 2})
</script>
```

## License

[MIT License](https://opensource.org/licenses/MIT)

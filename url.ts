export function encode(object: object, options: EncodeOptions = {}): string {
  const { listBracket, listIndex, objBracket, sort, drop = [] } = options;

  const concat = (parts: string[]) => parts.filter((e) => e).join("&");

  const keys = sort
    ? (obj: object) => Object.keys(obj).sort()
    : (obj: object) => Object.keys(obj);

  const parseObj = (name: string, obj: object) =>
    concat(
      keys(obj).map((key) =>
        objBracket
          ? nest(`${name}[${key}]`, obj[key])
          : nest(`${name}.${key}`, obj[key])
      )
    );

  const parseList = (
    name: string,
    list: any[],
    brackets = listBracket ? "[]" : ""
  ) =>
    list.length
      ? concat(
          list.map((elem, index) =>
            listIndex
              ? nest(`${name}[${index}]`, elem)
              : nest(name + brackets, elem)
          )
        )
      : encodeURIComponent(name + brackets);

  const nest = (name: string, value: any, type = typeof value) => {
    let result: string;
    if (drop.includes(value)) result = "";
    else if (/string|number|boolean|undefined/.test(type) || value === null)
      result = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    else if (Array.isArray(value)) result = parseList(name, value);
    else if (type === "object") result = parseObj(name, value);
    return result;
  };

  return object
    ? concat(keys(object).map((key) => nest(key, object[key])))
    : "";
}

const decoded = {
  true: true,
  false: false,
  null: null,
  undefined: undefined,
};

// Convert values to their native types
let decodeConvertor: (v: string) => Scalar = (v) =>
  !isNaN(Number(v)) ? +v : v in decoded ? decoded[v] : v;

export function decode(url: string, options: DecodeOptions = {}): object {
  const { convert, forceList, drop = [] } = options;

  // If node is undefined, create a new array
  // If node is not an array, convert it to an array
  const makeArray = (node: Node) =>
    node === undefined ? [] : Array.isArray(node) ? node : [node];

  const setVal = (node: Node, key: string, val: Node) => {
    if (!drop.includes(val)) node[key] = val;
  };
  const pushVal = (node: Node[], val: Node) => {
    if (!drop.includes(val)) node.push(val);
  };

  const set = (node: Node, key: string, value: string): Node => {
    let match: RegExpMatchArray | null;
    // If the key begins with [] or [number], add the value to the array
    if ((match = key.match(/^\[(\d*)\](.*)/))) {
      const [subKey, restKey]: [string, string] = [match[1], match[2]];
      node = makeArray(node);
      if (subKey) setVal(node, subKey, set(node[subKey], restKey, value));
      else pushVal(node, set(undefined, restKey, value));
    }
    // If the key begins with [] or [number], add the value to the array
    else if (
      (match = key.match(/^\.?([^\.\[\]]+)(.*)/) || key.match(/^\[(.*?)\](.*)/))
    ) {
      const [subKey, restKey]: [string, string] = [match[1], match[2]];
      // If node is missing, create an object
      if (node === undefined) node = {};
      // If node is scalar, e.g. a=1 and we set a.b=2, convert {a: 1} to {a: [1, {b: 2}]}
      else if (node !== Object(node)) node = [node];
      // If node is an array, push a new object to it and use that as the node
      if (Array.isArray(node))
        pushVal(node, { [subKey]: set(undefined, restKey, value) });
      else setVal(node, subKey, set(node[subKey], restKey, value));
    }
    // If the key is empty, add convert and set the value
    else {
      const val = convert ? decodeConvertor(value) : value;
      if (!drop.includes(val)) {
        // If there's an existing array, push to it
        if (Array.isArray(node)) node.push(val);
        // If there's no value, return it (as list, if required)
        else if (node === undefined) node = forceList ? [val] : val;
        // If there's a scalar/object, convert to array and push to it
        else node = [node, val];
      }
    }
    return node;
  };

  const node = {};
  for (const [key, value] of new URLSearchParams(url)) set(node, key, value);
  return node;
}

interface EncodeOptions {
  listBracket?: boolean;
  listIndex?: boolean;
  objBracket?: boolean;
  sort?: boolean;
  drop?: Scalar[];
}

interface DecodeOptions {
  convert?: boolean;
  forceList?: boolean;
  drop?: Node[];
}

type Node = Node[] | { [key: string]: Node } | Scalar;

type Scalar = string | number | boolean | null | undefined;

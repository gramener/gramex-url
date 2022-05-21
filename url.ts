export function encode(params: object, options: URLEncodeOptions = {}): string {
  const {
    listBracket, // append [] to array keys
    listIndex, // append [0], [1], ... to array keys
    objBracket, // use [key] instead of .key
    sort, // sort keys
    drop = [], // ignore keys with these values
  } = options;

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

  return params
    ? concat(keys(params).map((key) => nest(key, params[key])))
    : "";
}

interface URLEncodeOptions {
  listBracket?: boolean;
  listIndex?: boolean;
  objBracket?: boolean;
  sort?: boolean;
  drop?: (string | number | boolean | null | undefined)[];
}

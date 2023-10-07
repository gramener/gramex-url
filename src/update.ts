const decoded = {
  true: true,
  false: false,
  null: null,
  undefined: undefined,
};

const convertValue: (v: string) => Scalar = (v) => (!isNaN(Number(v)) ? +v : v in decoded ? decoded[v] : v);

const makeArray = (obj: any, key: string) => {
  obj[key] = Array.isArray(obj[key]) ? obj[key] : obj.hasOwnProperty(key) ? [obj[key]] : [];
  return obj[key];
};

export default function update(
  obj: any,
  url: string,
  settings?: {
    convert?: boolean;
    forceList?: boolean;
    pruneString?: boolean;
    pruneObject?: boolean;
    pruneArray?: boolean;
  },
): any {
  const {
    convert = false,
    forceList = false,
    pruneString = false,
    pruneObject = true,
    pruneArray = true,
  } = settings || {};
  const params = new URLSearchParams(url);

  // count[key] is the count of key in params
  const keyCount: { [key: string]: number } = {};
  for (const key of params.keys()) {
    const baseKey = key.replace(/\[\]$/, "");
    keyCount[baseKey] = (keyCount[baseKey] || 0) + 1;
  }

  for (const [key, value] of params.entries()) {
    const baseKey = key.replace(/\[\]$/, "");
    const convertedValue = convert ? convertValue(value) : value;
    const parts = key.split(".");
    const lastKey = parts.pop()!;
    let target = obj;

    for (const part of parts) {
      if (typeof target[part] !== "object")
        target[part] = target.hasOwnProperty(part) ? { [target[part]]: target[part] } : /^\d+$/.test(lastKey) ? [] : {};
      target = target[part];
    }

    switch (true) {
      case /-$/.test(lastKey):
        const removeKey = lastKey.slice(0, -1);
        if (convertedValue) {
          if (Array.isArray(target[removeKey])) {
            const index = target[removeKey].indexOf(convertedValue);
            if (index > -1) target[removeKey].splice(index, 1);
          } else if (target[removeKey] === convertedValue) delete target[removeKey];
        } else delete target[removeKey];
        break;
      case /~$/.test(lastKey):
        const toggleKey = lastKey.slice(0, -1);
        if (Array.isArray(target[toggleKey])) {
          const toggleIndex = target[toggleKey]?.indexOf(convertedValue);
          if (toggleIndex > -1) target[toggleKey].splice(toggleIndex, 1);
          else target[toggleKey].push(convertedValue);
        } else if (target[toggleKey] === convertedValue) delete target[toggleKey];
        else if (toggleKey in target) makeArray(target, toggleKey).push(convertedValue);
        else target[toggleKey] = convertedValue;
        break;
      case /\[\]$/.test(lastKey):
        makeArray(target, lastKey.slice(0, -2)).push(convertedValue);
        break;
      default:
        if (forceList || keyCount[baseKey] > 1) makeArray(target, lastKey).push(convertedValue);
        else target[lastKey] = convertedValue;
        break;
    }
  }

  const prune = (obj: any): any => {
    for (const key in obj)
      if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
        prune(obj[key]);
        if (pruneObject && Object.keys(obj[key]).length == 0) delete obj[key];
      } else if (pruneString && obj[key] === "") delete obj[key];
      else if (pruneArray && Array.isArray(obj[key]) && obj[key].length === 0) delete obj[key];
    return obj;
  };

  return prune(obj);
}

type Scalar = string | number | boolean | null | undefined;

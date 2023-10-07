export default function encode(
  obj: any,
  settings?: {
    listBracket?: boolean;
    listIndex?: boolean;
    objBracket?: boolean;
    sortKeys?: boolean;
    drop?: any[];
  },
): string {
  const { listBracket = false, listIndex = false, objBracket = false, sortKeys = false, drop = [] } = settings || {};

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "";
  const result: string[] = [];

  function traverse(value: any, prefix: string = "") {
    if (drop.includes(value)) return;

    if (Array.isArray(value)) {
      value.forEach((v, i) => traverse(v, listIndex ? `${prefix}[${i}]` : listBracket ? `${prefix}[]` : prefix));
    } else if (typeof value === "object" && value) {
      const keys = sortKeys ? Object.keys(value).sort() : Object.keys(value);
      keys.forEach((key) =>
        traverse(value[key], prefix ? (objBracket ? `${prefix}[${key}]` : `${prefix}.${key}`) : key),
      );
    } else {
      result.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(value)}`);
    }
  }

  traverse(obj);
  return result.join("&");
}

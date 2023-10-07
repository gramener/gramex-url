export { default as encode } from "./encode";
import { default as update } from "./update";
export { update };

export const decode = (
  url: string,
  settings?: { convert?: boolean; forceList?: boolean; pruneString?: boolean },
): any => update({}, url, settings);

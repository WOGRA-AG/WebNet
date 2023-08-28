export function cloneObject(object: Object) {
  return JSON.parse(JSON.stringify(object));
}

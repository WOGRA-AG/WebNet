import {XY} from "../core/interfaces/interfaces";

export function cloneObject(object: Object): any {
  return JSON.parse(JSON.stringify(object));
}

export function getTransformPosition(transformAttr: string): XY {
    const regex = /translate\(([^,]+),([^)]+)\)/;
    const pos = transformAttr.match(regex);
    return pos ? {x: parseFloat(pos[1]), y: parseFloat(pos[2])} : {x: 0, y: 0};
}

export function parseShapeString(shape: string) {
  const shapeArray = shape.split(',').map((val: string) => parseFloat(val.trim()));
  if (!shapeArray.some(isNaN)) {
    return shapeArray;
  }
  return null;
}

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

export function areBuilderEqual(obj1: any, obj2: any): boolean {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    if (!areBuilderEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

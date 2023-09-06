import {XY} from "../core/interfaces";

export function cloneObject(object: Object) {
  return JSON.parse(JSON.stringify(object));
}

export function getTransformPosition(transformAttr: string): XY {
    const regex = /translate\(([^,]+),([^)]+)\)/;
    const pos = transformAttr.match(regex);
    return pos ? {x: parseFloat(pos[1]), y: parseFloat(pos[2])} : {x: 0, y: 0};
}

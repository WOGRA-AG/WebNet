import {AbstractControl, FormControl} from "@angular/forms";
import {ProjectService} from "./services/project.service";

export function validateShapeArray(control: AbstractControl) {
  const shapeArray = control.value;
  if (typeof shapeArray !== 'string') {
    return {invalidShape: true};
  }
  const numbers = shapeArray.split(',').map((num: string) => parseInt(num.trim(), 10));
  if (numbers.some(isNaN)) {
    return {invalidShape: true};
  }
  return null;
}

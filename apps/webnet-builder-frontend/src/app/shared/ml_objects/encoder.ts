import {EncoderEnum} from "../../core/enums";

export const Encoder  = new Map<EncoderEnum, { name: string }>([
  [EncoderEnum.no, {name: 'No Encoding'}],
  [EncoderEnum.minmax, {name: 'MinMax Scaler'}],
  [EncoderEnum.label, {name: 'Label Encoder'}],
  [EncoderEnum.onehot, {name: 'One-Hot Encoder'}],
  [EncoderEnum.standard, {name: 'Standard Scaler'}],
])


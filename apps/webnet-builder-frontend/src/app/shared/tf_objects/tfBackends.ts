export const tfBackends = new Map<string, { name: string }>([
  ['webgl', {name: 'WebGL'}],
  ['webgpu', {name: 'WebGPU'}],
  ['wasm', {name: 'Web Assembly'}],
  ['cpu', {name: 'CPU'}],
])

export type StateExtract<M> =
  | ((model: M) => Record<string, any>)
  | Array<keyof M>

export type State<M, E extends StateExtract<any>> =
  E extends ((model: M) => infer R) 
    ? R
    : E extends Array<infer K extends keyof M>
      ? Pick<M, K> 
      : never
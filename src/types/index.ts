export type Draw = string; // 6-digit string "000000" - "999999"

export type StrategyName = 'hot' | 'cold' | 'markov' | 'mean' | 'gap' | 'hybrid' | 'inercia' | 'vecinos' | 'tendencia' | 'ciclo' | 'momentum';

export interface StrategyResult {
  num: number[];
  detail: string[];
}

export interface Strategy {
  label: string;
  icon: string;
  explain: string;
  logic: string;
  compute: (draws: Draw[]) => StrategyResult;
}

export interface DrawsState {
  draws: Draw[];
  userAdded: Draw[];
  disabled: Draw[]; // draws excluded from analysis but kept in list
}

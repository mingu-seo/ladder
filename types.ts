
export type GameStatus = 'INPUT' | 'READY' | 'ANIMATING' | 'FINISHED';

export interface Participant {
  id: string;
  name: string;
  character: string;
  color: string;
}

export interface ResultItem {
  id: string;
  text: string;
}

export interface Bridge {
  fromCol: number;
  level: number; // Y position segment
}

export interface PathStep {
  x: number;
  y: number;
}

export interface LadderData {
  participants: Participant[];
  results: ResultItem[];
  bridges: Bridge[];
  paths: PathStep[][]; // Pre-calculated paths for each participant
}

import { create } from 'zustand';
import { BoardState, initialBoard } from '../rules/board';

interface GameStore {
  board: BoardState;
}

const useGameStore = create<GameStore>(() => ({
  board: initialBoard(),
}));

export default useGameStore;

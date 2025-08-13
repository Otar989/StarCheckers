import React from 'react';
import useGameStore from '../state/game';
import { indexToCoord } from '../rules/board';

const Board: React.FC = () => {
  const board = useGameStore((s) => s.board);
  const handleCellClick = (index: number) => {
    console.log('click', index);
  };

  return (
    <div className="board-wrap">
      <div className="board">
        {board.map((piece, i) => {
          const dark = Math.floor(i / 8) % 2 === i % 2;
          return (
            <div
              key={indexToCoord(i)}
              className="cell"
              onClick={() => handleCellClick(i)}
              aria-label={indexToCoord(i)}
              style={{ background: dark ? 'var(--board-dark)' : 'var(--board-light)' }}
            >
              {piece && (
                <div
                  className="piece"
                  style={{
                    background: piece.toLowerCase() === 'w' ? 'var(--piece-light)' : 'var(--piece-dark)',
                    width: '80%',
                    height: '80%',
                    margin: '10%',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="board-caption">StarCheckers</div>
    </div>
  );
};

export default Board;

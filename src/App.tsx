import React from 'react';
import AppShell from './ui/AppShell';
import Board from './game/Board';

const App: React.FC = () => (
  <AppShell>
    <Board />
  </AppShell>
);

export default App;

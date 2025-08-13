import React, { PropsWithChildren } from 'react';

const AppShell: React.FC<PropsWithChildren> = ({ children }) => (
  <div id="app">
    <header className="appbar">
      <span>StarCheckers</span>
    </header>
    <div className="stage">
      <div className="game-center">{children}</div>
    </div>
    <footer className="footer" />
  </div>
);

export default AppShell;

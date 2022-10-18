import React, { useState } from 'react';
import './App.css';
import Canvas from './components/Canvas';
import { TDots, TLines } from './types';

function App() {
  const [lines, setLines] = useState<TLines[]>([]);
  const [dots, setDots] = useState<TDots[]>([])
  
  return (
    <div className="container">
      <Canvas lines={lines} setLines={setLines} dots={dots} setDots={setDots}/>
    </div>
  );
}

export default App;

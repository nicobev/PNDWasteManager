import { useState } from 'react'
import './App.css'
import Login from './screens/Login';
import WasteLogEntry from './screens/WasteLogEntry';
import ComponentPlayground from './screens/ComponentPlayground';

function App() {
  const [currentScreen,setCurrentScreen] = useState('login');

  return (
    <>
      <div>
        <nav>
          <button onClick={() => setCurrentScreen('login')}>Login</button>
          <button onClick={() => setCurrentScreen('logentry')}>Log Entry</button>
          <button onClick={() => setCurrentScreen('playground')}>Test Components</button>
        </nav>
        {currentScreen === 'login' && <Login />}
        {currentScreen === 'logentry' && <WasteLogEntry />}
        {currentScreen === 'playground' && <ComponentPlayground />}
      </div>
    </>
  );
}

export default App;

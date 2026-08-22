import { useState } from 'react'
import './App.css'
import Login from './screens/Login';
import WasteLogEntry from './screens/WasteLogEntry';

function App() {
  const [currentScreen,setCurrentScreen] = useState('login');

  return (
    <>
      <div>
        <nav>
          <button onClick={() => setCurrentScreen('login')}>Login</button>
          <button onClick={() => setCurrentScreen('logentry')}>Log Entry</button>
        </nav>
        {currentScreen === 'login' && <Login />}
        {currentScreen === 'logentry' && <WasteLogEntry />}
      </div>
    </>
  );
}

export default App;

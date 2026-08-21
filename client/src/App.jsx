import { useState } from 'react'
import './App.css'
import Login from './screens/Login';

function App() {
  const [currentScreen,setCurrentScreen] = useState('login');

  return (
    <>
      <div>
        <nav>
          <button onClick={() => setCurrentScreen('login')}>Login</button>
          {/* ...one button per screen, just for today's testing */}
        </nav>
        {currentScreen === 'login' && <Login />}
        {/* ... */}
      </div>
    </>
  );
}

export default App;

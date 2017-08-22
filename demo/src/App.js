import React, { Component } from 'react';

import tryItOut from './logic/try-it-out';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Eddystone Web Bluetooth</h1>
        <button className="big" onClick={() => tryItOut()}>Try it out!</button>
      </div>
    );
  }
}

export default App;

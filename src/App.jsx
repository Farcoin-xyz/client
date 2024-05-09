import React, {useEffect} from "react";
import { ConnectKitButton } from "connectkit";

import { Web3Provider } from "./Web3Provider.jsx";
// import Mint from "./Mint.jsx";
import Profile from "./Profile.jsx";
import Home from "./Home.jsx";

import {
  Link,
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
const App = () => {
  return (
    <div>
      <Web3Provider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="nav-bar" style={{ flex: '0 1' }}>
              <div style={{ flex: '1 0', paddingLeft: '1em' }}>
                <h1><Link to="/">Farcoin</Link></h1>
              </div>
              <div style={{ paddingRight: '1em' }}>
                <div className="connect-button" id="connect-button">
                  <ConnectKitButton id="btn" />
                </div>
              </div>
            </div>
            <div style={{ flex: '1 0' }}>
              <Routes>
                {/*<Route path="/mint" element={<Mint />} />*/}
                <Route path="/:fid" element={<Profile />} />
                <Route path="/" element={<Home />} />
              </Routes>
              <br />
              <br />
              <br />
              <br />
            </div>
            <div className="nav-bar footer">
              <Link to="https://github.com/Farcoin-xyz" target="_blank">Github</Link>
              <Link to="https://warpcast.com/~/channel/farcoin" target="_blank">Warpcast</Link>
              <Link to="https://github.com/Farcoin-xyz/blockchain" target="_blank">Contracts</Link>
            </div>
          </div>
        </Router>
      </Web3Provider>
    </div>
  );
};

export default App;

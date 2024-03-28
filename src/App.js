import React, {useEffect} from "react";
import { Web3Provider } from "./Web3Provider";
import Mint from "./Mint";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
const App = () => {
  useEffect(() => {
    console.log('here');
  }, []);
  return (
    <div>
      <Web3Provider>
        <Router>
          <Routes>
            <Route path="/" element={<Mint />} />
          </Routes>
        </Router>
      </Web3Provider>
    </div>
  );
};

export default App;

import React from "react";
import { Web3Provider } from "./Web3Provider";
import Mint from "./Mint";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

const App = () => {
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

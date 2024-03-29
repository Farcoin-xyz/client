import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useConnect, useContractWrite, useSignMessage } from "wagmi";
import { prettyAge } from "./utils";
import * as api from "./api";
import oracleAbi from "./oracle-abi.json"

const Mint = () => {
  const [mints, setMints] = useState({
    fidLastLikeTime: {},
    fidLastMintTime: {},
    fidLikes: {},
    fidNames: {},
    FIDs: [],
    count: 0,
  });
  const [scanningMints, setScanningMints] = useState(false);
  const [mintingFid, setMintingFid] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  const { connect } = useConnect();
  const { address } = useAccount();

  const {
    data: signedMessage,
    status: signStatus,
    error: signError,
    signMessage,
  } = useSignMessage();

  const {
    data: hash,
    status: writeStatus,
    error: writeError,
    writeContract,
  } = useContractWrite();

  useEffect(() => {
    api.getSession().then((result) => {
      setIsAuthenticated(!!result.user.address);
    });
  }, []);

  useEffect(() => {
    // User disconnects address - End session
    if (isAuthenticated && !address) {
      api.endSession().then((result) => {
        setIsAuthenticated(false);
      });
    }
  }, [address, isAuthenticated]);

  useEffect(() => {
    if (writeStatus === "error") {
      console.log(writeError);
      setMintingFid(null);
    } else if (writeStatus === "success") {
      const newMints = Object.assign({}, mints);
      newMints.fidLastMintTime[mintingFid] = newMints.fidLastLikeTime[mintingFid];
      setMints(newMints);
      setMintingFid(0);
    }
  }, [writeStatus]);

  useEffect(() => {
    if (signStatus === "error") {
      setScanningMints(false);
    } else if (signStatus === "success") {
      api.startSession({
        address,
        signature: signedMessage,
      }).then(result => {
        setIsAuthenticated(true);
        setCustomAddress(result.user.address);
        scanMints(result.user.address);
      }).catch(e => {
        window.alert(e.message);
        setScanningMints(false);
      });
    }
  }, [signStatus]);

  useEffect(() => {
    if (writeError) {
      window.alert(writeError.message.split("\n\n")[0]);
      setMintingFid(0);
    }
  }, [writeError]);

  useEffect(() => {
    if (signError) {
      window.alert(signError.message.split("\n\n")[0]);
      setScanningMints(false);
    }
  }, [signError]);

  const authAndScan = () => {
    setScanningMints(true);
    if (isAuthenticated && address) {
      setCustomAddress(address);
      scanMints(address);
    } else {
      api.getSessionCode().then(result => {
        console.log(`Authenticating on Farcoin.xyz\n\nCode: ${result.code}`);
        signMessage({ message: `Authenticating on Farcoin.xyz\n\nCode: ${result.code}` });
      });
    }
  };

  const scanMints = (address) => {
    setScanningMints(true);
    api.scanMints({ address }).then(result => {
      console.log(result);
      setMints(result);
      setScanningMints(false);
    }).catch(e => {
      setScanningMints(false);
      window.alert(e.message);
    });
  };

  const mint = (fid) => {
    setMintingFid(fid);
    api.signMints({ likerFid: fid }).then(result => {
      writeContract({
        address: "0xb8aD07dbE01d04CeF759202F06aF1a8F9ffEEba8",
        abi: oracleAbi,
        functionName: "verifyAndMint",
        args: result.mintArguments,
      });
    });
  };

  const connectWallet = () => {
    // Lol
    document.getElementById("connect-button").children[0].children[0].click();
  };

  const {
    fidLastLikeTime,
    fidLastMintTime,
    fidLikes,
    fidNames,
    FIDs,
    count,
  } = mints;

  return (
    <div>
      <div className="connect-button" id="connect-button">
        <ConnectKitButton id="btn" />
      </div>
      <div className="main-center">
        <h1>Farcoin</h1>
        <h2>A protocol for social tokens on Farcaster</h2>
        <p>A Like from the right person can be worth more than a thousand Likes from others. Yet today, Likes are reduced to a single number. </p>
        <p>With Farcoin, each user has own currency, called a fide. People can mint each other’s fides whenever they receive Likes from them.</p>
        <div>
          Links:&nbsp;&nbsp;
          <a target="_blank" href="https://warpcast.com/~/channel/farcoin">Warpcast</a>
          &nbsp;&nbsp;
          <a target="_blank" href="https://github.com/Farcoin-xyz">Github</a>
        </div>
        <p>If you have been casting Farcaster, you likely have fides to mint. Discover them below by connecting a wallet linked to your Farcaster account.</p>
        <p>Recent Likes may not appear immediately.</p>
        <div>
          <button disabled={scanningMints} onClick={address ? authAndScan : connectWallet}>
            {
              scanningMints ? (
                <span className="rotating char">◓</span>
              ) : (
                address ? (
                  `${isAuthenticated ? "scan" : "auth & scan"}`
                ) : "connect wallet"
              )
            }
          </button>
          <br />
          <br />
          <input
            type="text"
            name="address"
            placeholder="eth address"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
          />
          {" "}
          <button disabled={scanningMints} onClick={() => scanMints(customAddress)}>
            scan (no auth)
          </button>
          {
            FIDs.length > 0 ? (
              <div>
                {
                  !isAuthenticated && (
                    "You are not authenticated. Please authenticate to mint"
                  )
                }
                <br />
                <table className="mintable-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Last&nbsp;Liked</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      FIDs.map(fid => (
                        <tr id={fid}>
                          <td>
                            <a href={`https://warpcast.com/${fidNames[fid]}`}>{fidNames[fid]}</a>
                            <span style={{ color: "grey" }}>(FID:{fid})</span>
                          </td>
                          <td>
                            {prettyAge(fidLastLikeTime[fid])}
                          </td>
                          <td>
                          {
                            isAuthenticated && address && customAddress.toLowerCase() === address.toLowerCase() && (
                              <button
                                disabled={(!!mintingFid) || (fidLastLikeTime[fid] === fidLastMintTime[fid])}
                                onClick={() => mint(fid)}
                              >
                                {
                                  mintingFid === fid ? (
                                    <span className="rotating char">◓</span>
                                  ) : (
                                    <span>
                                      mint
                                    </span>
                                  )
                                }
                              </button>
                            )
                          }
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            ) : null
          }
        </div>
      </div>
    </div>
  );
};

export default Mint;

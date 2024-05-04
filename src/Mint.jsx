import React, { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useContractWrite } from "wagmi";
import { prettyAge } from "./utils";
import * as api from "./api";
import oracleAbi from "./oracle-abi.json"

const Mint = () => {
  const initialState = {
    fidLastLikeTime: {},
    fidLastMintTime: {},
    fidLikes: {},
    fidNames: {},
    FIDs: [],
    count: 0,
  };

  const [mints, setMints] = useState(Object.assign({}, initialState));
  const [scanningRecentLikes, setScanningRecentLikes] = useState(false);
  const [scanningUserLikes, setScanningUserLikes] = useState(false);
  const [mintingFid, setMintingFid] = useState(0);
  const [customAddress, setCustomAddress] = useState("");
  const [handle, setHandle] = useState("");
  const [searching, setIsSearching] = useState(false);
  const [singleMintArgs, setSingleMintArgs] = useState(null);

  const { address } = useAccount();

  const {
    data: hash,
    status: writeStatus,
    error: writeError,
    writeContract,
  } = useContractWrite();

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
    if (writeError) {
      setMintingFid(0);
      // window.alert(writeError.message.split("\n\n")[0]);
    }
  }, [writeError]);

  const scanMints = () => {
    setSingleMintArgs(null);
    setScanningRecentLikes(true);
    api.scanMints({ address }).then(result => {
      console.log(result);
      setMints(result);
      setScanningRecentLikes(false);
    }).catch(e => {
      setScanningRecentLikes(false);
      // window.alert(e.message);
    });
  };

  const signAndMint = async (fid) => {
    setMintingFid(fid);
    const { mintArguments } = await api.signMints({ likerFid: fid, likedAddress: address }); 
    writeContract({
      address: "0x9e78abe45f351257fc7242856a3d4329fcc34722",
      abi: oracleAbi,
      functionName: "verifyAndMint",
      args: mintArguments,
    });
  };

  const mint = (fid) => {
    setMintingFid(fid);
    writeContract({
      address: "0x9e78abe45f351257fc7242856a3d4329fcc34722",
      abi: oracleAbi,
      functionName: "verifyAndMint",
      args: singleMintArgs,
    });
  };

  const connectWallet = () => {
    // Lol
    document.getElementById("connect-button").children[0].children[0].click();
  };

  const searchForUser = async () => {
    try {      
      setScanningUserLikes(true);
      setMints(Object.assign({}, initialState));
      const user = await api.searchUser({ query: handle.replace('@', '') });
      const { mintArguments } = await api.signMints({ likerFid: user.fid, likedAddress: address }); 
      setSingleMintArgs(mintArguments);
      setScanningUserLikes(false);
    } catch (e) {
      console.log(e);
      setScanningRecentLikes(false);
    }
  };

  const {
    fidLastLikeTime,
    fidLastMintTime,
    fidLikes,
    fidNames,
    FIDs,
    count,
  } = mints;

  console.log(singleMintArgs);

  return (
    <div>
      <div className="main-center">
        <br />
        <p>If you have been casting Farcaster, you likely have fides to mint. Discover them below by connecting a wallet linked to your Farcaster account.</p>
        <p>Most recent Likes may not appear immediately.</p>
        <div>
          <br />
          {
            address ? (
              <div style={{ display: "flex" }}>
                <button disabled={scanningRecentLikes || scanningUserLikes} onClick={scanMints}>
                  {
                    scanningRecentLikes ? (
                      <span className="rotating char">◓</span>
                    ) : (
                      "Fetch recent likes"
                    )
                  }
                </button>
                <span>&nbsp;&nbsp;or&nbsp;&nbsp;</span>
                <input 
                  type="text" 
                  value={handle}
                  disabled={scanningRecentLikes || scanningUserLikes}
                  onChange={e => setHandle(e.target.value)} 
                  style={{ flex: "1 0", maxWidth: "10em" }} 
                  placeholder="Search @user" 
                />
                <button onClick={searchForUser} style={{ marginLeft: ".5em" }} disabled={scanningUserLikes || scanningRecentLikes}>
                  {
                    scanningUserLikes ? (
                      <span className="rotating char">◓</span>
                    ) : (
                      'Search'
                    )
                  }
                </button>
              </div>
            ) : (
              <div>
                <ConnectKitButton id="btn-2" /> to get started
              </div>
            )
          }
          <br />
          {
            singleMintArgs ? (
              <div>
                <span>You have {singleMintArgs[4]} fide{singleMintArgs[4] != 1 ? 's' : ''} you can mint. </span>
                <button onClick={mint} disabled={!!mintingFid}>
                  {
                    mintingFid ? (
                      <span className="rotating char">◓</span>
                    ) : (
                      'mint'
                    )
                  }
                </button>
              </div>
            ) : null
          }
          {
            !singleMintArgs && FIDs.length > 0 ? (
              <div>
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
                            <span style={{ color: "grey" }}> (FID:{fid})</span>
                          </td>
                          <td>
                            {prettyAge(fidLastLikeTime[fid])}
                          </td>
                          <td>
                          <button
                            disabled={(!!mintingFid) || (fidLastLikeTime[fid] <= fidLastMintTime[fid])}
                            onClick={() => signAndMint(fid)}
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

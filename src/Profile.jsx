import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { useAccount, useContractWrite } from "wagmi";

import oracleAbi from "./oracle-abi.json"
import { prettyAge } from "./utils";
import * as api from "./api";

const Profile = () => {
  const { fid } = useParams();

  const [username, setUsername] = useState(null);
  const [singleMintArgs, setSingleMintArgs] = useState(null);
  const [scanningUserLikes, setScanningUserLikes] = useState(false);
  const [mintingFid, setMintingFid] = useState(0);
  const [fideOwners, setFideOwners] = useState([]);
  const [fidesOwned, setFidesOwned] = useState([]);

  const { address } = useAccount();

  useEffect(() => {
    setUsername(null);
    setFideOwners([]);
    setFidesOwned([]);
    if (fid) {
      api.getUserByFid(fid).then((result) => {
        setUsername(result.username);
      });
      api.getFideOwners({ fid }).then((result) => {
        setFideOwners(result);
      });
      api.getFidesOwned({ fid }).then((result) => {
        setFidesOwned(result);
      });
    }
  }, [fid]);

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
      setMintingFid(0);
    }
  }, [writeStatus]);

  useEffect(() => {
    if (writeError) {
      setMintingFid(0);
      // window.alert(writeError.message.split("\n\n")[0]);
    }
  }, [writeError]);


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

  const scanUserLikes = async () => {
    try {
      setScanningUserLikes(true);
      const { mintArguments } = await api.signMints({ likerFid: fid, likedAddress: address });
      setSingleMintArgs(mintArguments);
      setScanningUserLikes(false);
    } catch (e) {
      setScanningUserLikes(false);
      console.log(e.response.data);
      if (e.response.data.error) {
        window.alert(e.response.data.error);
      }
    }
  };

  const connectWallet = () => {
    // Lol
    document.getElementById("connect-button").children[0].children[0].click();
  };

  return (
    <div className="main-center-wrapper">
      <div className="main-center" style={{ paddingBottom: "3em" }}>
        <h1>{username ? (
          <Link to={`https://warpcast.com/${username}`} target="_blank">@{username}&nbsp;➚</Link>
        ) : `Fide ${fid}`}</h1>
        <br />
        {
          !address ? (
            <div className="mint-connect-button">
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={connectWallet}>Connect Wallet</span>
              <span> to mint</span>
            </div>
          ) : (
            <div>
              {
                singleMintArgs ? (
                  <div>
                    <span>🥳 You have <b>{singleMintArgs[4]} fide{singleMintArgs[4] != 1 ? 's' : ''}</b> to mint. </span>
                    {
                      hash ? (
                        <Link to={`https://basescan.org/tx/${hash}`} target="_blank">View&nbsp;transaction&nbsp;➚</Link>
                      ) : (
                        <button onClick={mint} disabled={!!mintingFid}>
                          {
                            mintingFid ? (
                              <span className="rotating char">◓</span>
                            ) : (
                              'mint'
                            )
                          }
                        </button>
                      )
                    }
                  </div>
                ) : (
                  <button onClick={scanUserLikes} disabled={scanningUserLikes}>
                    {
                      scanningUserLikes ? (
                        <span className="rotating char">◓</span>
                      ) : (
                        'Mint fides'
                      )
                    }
                  </button>
                )
              }
            </div>
          )
        }
        <br />
        <h3>Owners of {username ? `${username}'s fides` : `Fide ${fid}`}</h3>
        {
          fideOwners.length > 0 ? (
            <div style={{ display: "inline-block", textAlign: "left" }}>
              {
                fideOwners.map(fide => (
                  <div id={`owned-${fide.fid}`}>
                    <div style={{ display: 'block', marginBottom: '.5em' }}>
                      <Link to={`/${fide.liker_fid}`}>@{fide.name}</Link> minted {fide.likes}
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div style={{ fontStyle: 'italic' }}>None Found</div>
          )
        }
        <br />
        <h3>Fides minted by {username ? `${username}` : `FID ${fid}`}:</h3>
        {
          fidesOwned.length > 0 ? (
            <div style={{ display: "inline-block", textAlign: "left" }}>
              {
                fidesOwned.map(fide => (
                  <div id={`owned-${fide.fid}`}>
                    <div style={{ display: 'block', marginBottom: '.5em' }}>
                      {fide.likes} from <Link to={`/${fide.liker_fid}`}>@{fide.name}</Link>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div style={{ fontStyle: 'italic' }}>None Found</div>
          )
        }
        <div style={{ textAlign: "center" }}>
        </div>
      </div>
    </div>
  );
};

export default Profile;

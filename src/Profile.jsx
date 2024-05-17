import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { formatUnits } from "viem";
import { useAccount, useContractWrite, useContractRead } from "wagmi";

import oracleAbi from "./oracle-abi.json"
import minterAbi from "./minter-abi.json"
import fideAbi from "./fide-abi.json"
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
  const [verifications, setVerifications] = useState([]);
  const [claiming, setClaiming] = useState(false);

  const { address } = useAccount();

  const normalizedAddress = (address || '').toLowerCase();

  const ownsProfile = verifications.filter(v => normalizedAddress == v.toLowerCase()).length > 0;

  useEffect(() => {
    setUsername(null);
    setFideOwners([]);
    setFidesOwned([]);
    setVerifications([]);
    if (fid) {
      api.getUserByFid(fid).then((result) => {
        setUsername(result.username);
        setVerifications(result.verifiedAddresses.eth_addresses);
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

  const { data: fideAddress, isError: fideError, isLoading: fideLoading }  = useContractRead({
    address: '0x9d5CE03b73a2291f5E62597E6f27A91CA9129d97',
    abi: minterAbi,
    functionName: 'getFide',
    args: [fid],
  });

  const { data: rewardBalance, isError: rewardError, isLoading: rewardLoading }  = useContractRead({
    address: '0x9d5CE03b73a2291f5E62597E6f27A91CA9129d97',
    abi: minterAbi,
    functionName: 'getRewardBalance',
    args: [fid],
  });

  const { data: fideBalance, isError: balanceError, isLoading: balanceLoading }  = useContractRead({
    address: fideAddress,
    abi: fideAbi,
    functionName: 'balanceOf',
    args: [fideAddress],
  });

  useEffect(() => {
    if (writeStatus === "error") {
      console.log(writeError);
      setMintingFid(null);
      setClaiming(false);
    } else if (writeStatus === "success") {
      setMintingFid(0);
      setClaiming(false);
    }
  }, [writeStatus]);

  useEffect(() => {
    if (writeError) {
      setMintingFid(0);
      setClaiming(false);
      // window.alert(writeError.message.split("\n\n")[0]);
    }
  }, [writeError]);

  const signAndClaim = async () => {
    try {
      setClaiming(true);
      const { claimArguments } = await api.signClaims({ likerFid: fid, likerAddress: address });
      writeContract({
        address: "0x9e78abe45f351257fc7242856a3d4329fcc34722",
        abi: oracleAbi,
        functionName: "verifyAndClaim",
        args: claimArguments,
      });
    } catch (e) {
      setClaiming(false);
    }
  };

  const mint = () => {
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
                ownsProfile ? (
                  <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '1em' }}>
                    <div>
                      <p style={{ fontWeight: 'bold' }}>Claimable fides: {formatUnits(fideBalance || 0n, 18)}</p>
                      <p>Whenever someone mints your fides<br /> an additional 10% is reserved for you.</p>
                      <p style={{ fontWeight: 'bold' }}>Claimable $FRC: {formatUnits(rewardBalance || 0n, 18)}</p>
                      <p>You earn Farcoin&apos;s protocol token $FRC <br />whenever an FID mints your fides first.</p>
                      {
                        hash ? (
                          <Link to={`https://basescan.org/tx/${hash}`} target="_blank">View&nbsp;transaction&nbsp;➚</Link>
                        ) : (
                          <button onClick={signAndClaim} disabled={claiming || fideBalance == 0n}>
                            {
                              claiming ? (
                                <span className="rotating char">◓</span>
                              ) : (
                                'Claim'
                              )
                            }
                          </button>
                        )

                      }
                    </div>
                  </div>
                ) : (
                  <div>
                    {
                      singleMintArgs ? (
                        <div>
                          <p>🥳 You have <b>{singleMintArgs[4]} fide{singleMintArgs[4] != 1 ? 's' : ''}</b> to mint. </p>
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
                        <div>
                          <p>Has {username ? `${username}` : `FID ${fid}`} liked your casts?</p>
                          <p>If so, mint their fides below.</p>
                          <button onClick={scanUserLikes} disabled={scanningUserLikes}>
                            {
                              scanningUserLikes ? (
                                <span className="rotating char">◓</span>
                              ) : (
                                'Check eligibility'
                              )
                            }
                          </button>
                        </div>
                      )
                    }
                  </div>
                )
              }
            </div>
          )
        }
        <br />
        <h3>Top minters</h3>
        {
          fideOwners.length > 0 ? (
            <div style={{ display: "inline-block", textAlign: "left" }}>
              {
                fideOwners.map(fide => (
                  <div key={`owners-${fide.liked_fid}`}>
                    <div style={{ display: 'block', marginBottom: '.5em' }}>
                      <Link to={`/${fide.liked_fid}`}>@{fide.name}</Link> minted {fide.likes}
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
        <h3>{username ? `${username}` : `FID ${fid}`} minted</h3>
        {
          fidesOwned.length > 0 ? (
            <div style={{ display: "inline-block", textAlign: "left" }}>
              {
                fidesOwned.map(fide => (
                  <div key={`owned-${fide.liker_fid}`}>
                    <div style={{ display: 'block', marginBottom: '.5em' }}>
                      {fide.likes} of <Link to={`/${fide.liker_fid}`}>@{fide.name}</Link>
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

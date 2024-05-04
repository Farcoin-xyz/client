import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ConnectKitButton } from "connectkit";
import { useAccount, useConnect, useContractWrite, useSignMessage } from "wagmi";
import { prettyAge } from "./utils";
import * as api from "./api";
import oracleAbi from "./oracle-abi.json"

const Mint = () => {
  const [mints, setMints] = useState({
    recentMints: [],
    fidNames: {},
  });
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

  useEffect(() => {
    api.getSession().then((result) => {
      setIsAuthenticated(!!result.user.address);
    });
  }, []);

  useEffect(() => {
    api.getRecentMints().then((result) => {
      setMints(result);
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
        setScanningMints(false);
        // window.alert(e.message);
      });
    }
  }, [signStatus]);

  useEffect(() => {
    if (signError) {
      setScanningMints(false);
      // window.alert(signError.message.split("\n\n")[0]);
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

  const {
    recentMints,
    fidNames,
  } = mints;

  console.log("RM", recentMints, fidNames);

  return (
    <div>
      <div className="home-header">
        <div className="hero">Turn Likes into Currency</div>
        <div className="hero-subheader">Farcoin is a protocol for <br />social tokens on Farcaster</div>
      </div>
      <div className="main-center" style={{ paddingBottom: "3em" }}>
        <br />
        <br />
        <p>Every Farcaster user now their own currency, called a Fide. The protocol brings Farcaster hub data onchain, enabling you to mint others' fides as they like your casts.</p>
        <h2>Recent mints</h2>
        <div style={{ textAlign: "center" }}>
          {
            recentMints.length > 0 && (
              <div style={{ display: "inline-block", textAlign: "left" }}>
                {
                  recentMints.map(mint => (
                    <div id={mint.id}>
                      <div style={{ display: 'inline-block', marginBottom: '.5em' }}>
                        <a href={`https://farcaster.id/${fidNames[mint.liked_fid]}`} target="_blank">@{fidNames[mint.liked_fid]}</a>
                        <span> minted {mint.quantity_likes} of </span>
                        <a href={`https://farcaster.id/${fidNames[mint.liker_fid]}`} target="_blank">@{fidNames[mint.liker_fid]}</a>
                        <span>&apos;s fides</span>
                      </div>
                      <br />
                    </div>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Mint;

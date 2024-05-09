import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AsyncSelect from 'react-select/async';

import { prettyAge } from "./utils";
import * as api from "./api";

const searchUsers = async (inputValue) => {
  const users = await api.searchUsers(inputValue);
  return users.map(u => ({
    label: `@${u.username}`,
    value: u.fid
  }));
};

const Mint = () => {
  const [mints, setMints] = useState({
    recentMints: [],
    fidNames: {},
  });

  const navigate = useNavigate();

  useEffect(() => {
    api.getRecentMints().then((result) => {
      setMints(result);
    });
  }, []);

  const {
    recentMints,
    fidNames,
  } = mints;

  return (
    <div>
      <div className="home-header">
        <div className="hero">🖤 ⤻ 🪙</div>
        <div className="hero-subheader">Farcoin is a protocol for <br />social tokens on Farcaster</div>
        <br />
        <br />
        <AsyncSelect
          className="hero-search"
          onChange={(data) => data.value ? navigate(`/${data.value}`) : null}
          cacheOptions
          loadOptions={searchUsers}
          placeholder="Search @user"
        />
      </div>
      <div className="main-center-wrapper">
        <div className="main-center" style={{ paddingBottom: "3em" }}>
          <br />
          <br />
          <p>You make a cast and dwr gives it a like. It feels significant, so why isn't it onchain? Farcoin lets you mint that Like as a unit of currency tied to Dan&apos;s FID.</p>
          <p>Farcoin assigns every FID its own currency, called a Fide. The protocol brings Farcaster hub data onchain, so you can mint fides whenever you receive likes.</p>
          <br />
          <br />
          <h2>Recent mints</h2>
          <div style={{ textAlign: "center" }}>
            {
              recentMints.length > 0 && (
                <div style={{ display: "inline-block", textAlign: "left" }}>
                  {
                    recentMints.map(mint => (
                      <div id={mint.id}>
                        <div style={{ display: 'inline-block', marginBottom: '.5em' }}>
                          <a href={`/${mint.liked_fid}`}>@{fidNames[mint.liked_fid]}</a>
                          <span> minted {mint.quantity_likes} of </span>
                          <a href={`/${mint.liker_fid}`}>@{fidNames[mint.liker_fid]}</a>
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
    </div>
  );
};

export default Mint;

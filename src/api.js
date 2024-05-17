import axios from 'axios';
axios.defaults.withCredentials = true;

// TODO: Make config-driven
const HOST = window.location.href.indexOf('http://localhost:') === 0 ? (
  'http://localhost:8000'
) : (
  'https://farcoin.xyz'
);

export const signMints = async params => {
  const response = await axios.post(`${HOST}/mint`, params);
  return response.data.result;
}

export const signClaims = async params => {
  const response = await axios.post(`${HOST}/claim`, params);
  return response.data.result;
}

export const searchUsers = async username => {
  const response = await axios.get(`${HOST}/search-users`, {params:{username}});
  return response.data.result;
}

export const getUserByUsername = async username => {
  const response = await axios.get(`${HOST}/user-by-username`, {params:{username}});
  return response.data.result;
}

export const getUserByFid = async fid => {
  const response = await axios.get(`${HOST}/user-by-fid`, {params:{fid}});
  return response.data.result;
}

export const getFideOwners = async params => {
  const response = await axios.get(`${HOST}/owners-by-fid`, {params});
  return response.data.result;
}

export const getFidesOwned = async params => {
  const response = await axios.get(`${HOST}/owned-by-fid`, {params});
  return response.data.result;
}

export const startSession = async (params) => {
  const response = await axios.post(`${HOST}/session/start`, params);
  return response.data.result;
}

export const endSession = async () => {
  const response = await axios.post(`${HOST}/session/end`);
  return response.data.result;
}

export const getSessionCode = async () => {
  const response = await axios.post(`${HOST}/session/code`);
  return response.data.result;
}

export const getSession = async params => {
  const response = await axios.get(`${HOST}/session`, { params });
  return response.data.result;
}

export const getRecentMints = async () => {
  const response = await axios.get(`${HOST}/recent-mints`);
  return response.data.result;
}

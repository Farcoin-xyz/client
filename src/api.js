import axios from 'axios';
axios.defaults.withCredentials = true;

// TODO: Make config-driven
const HOST = window.location.href.indexOf('http://localhost:') === 0 ? (
  'http://localhost:8000'
) : (
  'https://farcoin.xyz'
);

export const scanMints = async params => {
  const response = await axios.get(`${HOST}/scan`, { params });
  return response.data.results;
}

export const signMints = async params => {
  const response = await axios.post(`${HOST}/mint`, params);
  return response.data.results;
}

export const searchUser = async params => {
  const response = await axios.post(`${HOST}/lookup-user`, params);
  return response.data.results;
}

export const startSession = async (params) => {
  const response = await axios.post(`${HOST}/session/start`, params);
  return response.data.results;
}

export const endSession = async () => {
  const response = await axios.post(`${HOST}/session/end`);
  return response.data.results;
}

export const getSessionCode = async () => {
  const response = await axios.post(`${HOST}/session/code`);
  return response.data.results;
}

export const getSession = async params => {
  const response = await axios.get(`${HOST}/session`, { params });
  return response.data.results;
}

export const getRecentMints = async params => {
  const response = await axios.get(`${HOST}/mint/recent`, { params });
  return response.data.results;
}

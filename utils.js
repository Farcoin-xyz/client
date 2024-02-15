export const prettyAge = (timestamp) => {
  const now = Math.floor(new Date().getTime() / 1000);
  const elapsed = now - timestamp;
  if (elapsed < 60) {
    return "now";
  } else if (elapsed < 3600) {
    return `${Math.floor(elapsed / 60)}m ago`;
  } else if (elapsed < 86400) {
    return `${Math.floor(elapsed / 3600)}h ago`;
  } else {
    return `${Math.floor(elapsed / 86400)}d ago`;
  }
};

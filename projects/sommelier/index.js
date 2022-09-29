const sdk = require("@defillama/sdk");
const abiCellarAave = require("./cellar-aave.json");

const CELLAR_AAVE = "0x7bad5df5e11151dc5ee1a648800057c5c934c0d5";
const chain = "ethereum";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // TVL for the AAVE Cellar is the sum of:
  // totalAssets (assets invested into aave)
  // totalHoldings (assets deposited into the strategy but uninvested)
  // totalLocked (yield waiting to be distributed to shareholders)
  const totalAssets = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.totalAssets,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  const totalHoldings = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.totalHoldings,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  const totalLocked = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.totalLocked,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  // asset is the underlying ERC20 the cellar is invested in
  const assetAddress = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.asset,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  // Sum up total assets, holdings, and locked yield
  sdk.util.sumSingleBalance(balances, `${chain}:${assetAddress}`, totalAssets);
  sdk.util.sumSingleBalance(
    balances,
    `${chain}:${assetAddress}`,
    totalHoldings
  );
  sdk.util.sumSingleBalance(balances, `${chain}:${assetAddress}`, totalLocked);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Sum up total assets ",
  start: 1656652494,
  hallmarks: [],
  [chain]: { tvl },
};

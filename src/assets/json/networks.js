/*
 * @Author: Asadhcj asadhcj@163.com
 * @Date: 2026-02-04 19:37:33
 * @LastEditors: Asadhcj asadhcj@163.com
 * @LastEditTime: 2026-02-04 19:47:06
 * @FilePath: \web3_project\choose-dapp\src\assets\json\networks.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default [
  {
    name: "Sepolia TestNet",
    chainId: 11155111,
    img: "eth.svg",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ",
    explorerUrl: "https://sepolia.etherscan.io",
    currency: "ETH",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0xe5dE0e7f8d0c44190c8Aa512B4E999d7ec7F65F7",
    cpContract: "0x5576cA7b329F2931cDC7D14f11362d03a5760E4E",
    ethContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    bridgeContract: "0xa84593B6FC3DF802fBEa7Ed8a72EEF05Ca6f19f9",
  },
  {
    name: "Op TestNet",
    chainId: 11155420,
    img: "optimism.svg",
    rpcUrl: "https://opt-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ",
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    currency: "ETH",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0x39A1eA1f9F1E55898013a494B022e52597099970",
    cpContract: "0x572977b99292d985cc39f1574Ae429b61A375813",
    ethContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    bridgeContract: "0x04557519Fb29146d29203faD03B307F1775527E0",
  },
  {
    name: "cp chain",
    chainId: 86606,
    img: "cp.svg",
    rpcUrl: "https://rpc-testnet.cpchain.com",
    explorerUrl: "https://explorer-testnet.cpchain.com",
    currency: "CP",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0x6C255b22864bBC176431c42695D16f41576e5618",
    cpContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    ethContract: "0x478210a1678046a0C6af45D159176e75B1BACA91",
    bridgeContract: "0x558A58D22d5fE5832A2E11Eb0f89552a8C85190f",
  },
  {
    name: "BSC Mainnet",
    chainId: 56,
    img: "bnb.png",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    currency: "BNB",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    cpContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    ethContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    bridgeContract: "0x0000000000000000000000000000000000000000",
    usdtTokenAddress: import.meta.env.VITE_USDT_TOKEN_ADDRESS,
    proxyAirdropManager: "0x68f8E787d966eAf409a0D3D46789e710791609F0",
    proxyChooseMeToken: "0x2a63E5e37e51CdcB1faf8E699E8658E7B2a969a9",
    proxyDaoRewardManager: "0x09596653c6501A262E745cdE5aece74BAF644ad2",
    proxyEventFundingManager: "0x59E412c89f8361cab0fe6738D4eC2Fb6dA86e0b4",
    proxyFomoTreasureManager: "0xE764a5bC22ce6BDD02028DAC1C5EcfF4b790edB2",
    proxyMarketManager: "0x400c799B17C1e41164383E4A649478FDAB8D85d6",
    proxyNodeManager: import.meta.env.VITE_PROXY_NODE_MANAGER,
    proxyStakingManager: "0x09B165F7504782CcC83A9aF68fb2C0835497e554",
    proxySubTokenFundingManager: "0xC96d2399a3b70d898EEb29Ce6f318F71D8A2Ac27",
  },
];

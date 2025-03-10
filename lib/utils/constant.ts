export interface ICommand {
  name: string;
  description: string;
  usage: string;
  script: string;
  example: string;
}

export const commands: ICommand[] = [
  {
    name: "Help",
    description: "Get help with available commands",
    usage: "/help",
    script: "/help",
    example: "/help",
  },
  {
    name: "Create a meme coin",
    description: "Create a meme coin",
    usage: "/mCreate",
    script: "/mCreate <name> <token> <supply>",
    example: "/mCreate DogeCoin DOGE 10000000",
  },
  {
    name: "Swap tokens",
    description: "Swap tokens",
    usage: "/mSwap",
    script:
      "/mSwap <chainId> <sellToken> <buyToken> <sellAmount> <slippageBps>",
    example:
      "/mSwap 8453 0x1234567890123456789012345678901234567890 0x1234567890123456789012345678901234567890 0.5 100",
  },
  {
    name: "List tokens",
    description: "List tokens",
    usage: "/mListTokens",
    script: "/mListTokens <address> <name> <symbol>",
    example: "/mListTokens 0x1234567890123456789012345678901234567890 MTK MTK",
  },
  {
    name: "Get token detail",
    description: "Get token detail",
    usage: "/mTokenDetail",
    script: "/mTokenDetail <address>",
    example: "/mTokenDetail 0x1234567890123456789012345678901234567890",
  },
  {
    name: "Meme coin setting",
    description: "Meme coin setting",
    usage: "/mm ",
    script:
      "/mm <accountId> <slippage> <token0> <token1> <type> <chainId> <minAmount> <maxAmount> <targetPrice> <minDelay> <maxDelay>",
    example:
      "/mm <accountId> <slippage> <token0> <token1> <type> <chainId> <minAmount> <maxAmount> <targetPrice> <minDelay> <maxDelay>",
  },
  {
    name: "Get setting",
    description: "Get meme coin setting",
    usage: "/mGS ",
    script: "/mGS <settingId>",
    example: "/mGS 112233",
  },
  {
    name: "Send meme coin token",
    description: "Send meme coin token",
    usage: "/mSendToken ",
    script:
      "/mSendToken <address> <amount> <privateKey> <wallet1>,<wallet2>,<wallet3>,...",
    example:
      "/mSendToken <address> <amount> <privateKey> <wallet1>,<wallet2>,<wallet3>,...",
  },
  {
    name: "Create a swap token",
    description: "Create a new token and list to uniswap v3",
    usage: "/mCreateV3",
    script:
      "/mCreateV3 <name> <token> <supply> <tokenAddress> <tokenAmount> <initialAmount>",
    example:
      "/mCreateV3 DogeCoin DOGE 10000000 0x1234567890123456789012345678901234567890 100000 100000",
  },
  {
    name: "Get quote for a swap",
    description: "Get quote for a swap",
    usage: "/mQuote",
    script:
      "/mQuote <chainId> <sellToken> <buyToken> <sellAmount> <slippageBps>",
    example:
      "/mQuote 8453 0x1234567890123456789012345678901234567890 0x1234567890123456789012345678901234567890 0.5 100",
  },
  {
    name: "Wallet",
    description: "Create a new wallet",
    usage: "/mW",
    script: "/mW",
    example: "/mW",
  },
  {
    name: "Liquidity",
    description: "Add liquidity too a pool",
    usage: "/mL",
    script: "/mL <chainId> <tokenA> <tokenB> <amountA> <amountB> <taker>",
    example: "/mL <chainId> <tokenA> <tokenB> <amountA> <amountB> <taker>",
  },
  {
    name: "Get price",
    description: "Get price for a swap",
    usage: "/mprice",
    script: "/mprice <chainId> <sellToken> <buyToken> <slippageBps>",
    example: "/mprice <chainId> <sellToken> <buyToken> <slippageBps>",
  },
  {
    name: "Get quote",
    description: "Get quote for a swap",
    usage: "/mquote",
    script:
      "/mquote <chainId> <sellToken> <buyToken> <sellAmount> <slippageBps>",
    example:
      "/mquote <chainId> <sellToken> <buyToken> <sellAmount> <slippageBps>",
  },
];

export const AVAILABLE_COMMANDS = [];

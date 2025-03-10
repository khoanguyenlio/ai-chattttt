import CoinService, { SettingType } from "../coin-service";
import { commands } from "./constant";
interface CommandResult {
  success: boolean;
  response: string;
}

export const handleCommands = async (
  message: string
): Promise<CommandResult | null> => {
  if (!message.startsWith("/")) {
    return null;
  }

  const args = message.split(" ");
  const command = args[0].toLowerCase();

  switch (command) {
    case "/help":
      return {
        success: true,
        response: [
          "Available commands:\n\n",
          ...commands.map((c, i) => [
            `${i + 1}. ${c.script}\n\n`,
            `Description: ${c.description}\n\n`,
            `Example: ${c.example}\n\n`,
          ]),
        ]
          .flat()
          .join(" "),
      };

    case "/mprice": {
      const [, chainId, sellToken, buyToken, slippageBps] = args.map((i) =>
        i.trim().replace(/\t/g, "").replace(/\n/g, "")
      );

      const [data, error] = await CoinService.getPrice({
        chainId: +chainId,
        sellToken,
        buyToken,
        slippageBps,
      });

      if (error || !data?.[0]) {
        return {
          success: false,
          response: [
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Pricing:\n\n",
          `Sell Token: ${data.sellToken}\n\n`,
          `Buy Token: ${data.buyToken}\n\n`,
          `Sell Amount: ${data.sellAmount}\n\n`,
          `Buy Amount: ${data.buyAmount}\n\n`,
        ].join(" "),
      };
    }

    case "/mquote": {
      const [, chainId, sellToken, buyToken, sellAmount, slippageBps] =
        args.map((i) => i.trim().replace(/\t/g, "").replace(/\n/g, ""));

      const [data, error] = await CoinService.getQuote({
        chainId: +chainId,
        sellToken,
        buyToken,
        sellAmount,
        slippageBps,
      });

      if (error) {
        return {
          success: false,
          response: [
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }
      console.log("asdasdsadsadas", data);
      return {
        success: true,
        response: [
          "Quoted meme:\n\n",
          "--------\n\n",
          `Sell Token: ${data.sellToken}\n\n`,
          `Buy Token: ${data.buyToken}\n\n`,
          `Sell Amount: ${data.sellAmount}\n\n`,
          `Buy Amount: ${data.buyAmount}\n\n`,
        ].join(" "),
      };
    }

    case "/ml": {
      const [, chainId, tokenA, tokenB, amountA, amountB, taker] = args.map(
        (i) => i.trim().replace(/\t/g, "").replace(/\n/g, "")
      );

      const [data, error] = await CoinService.addLiquidity({
        chainId: +chainId,
        tokenA,
        tokenB,
        amountA,
        amountB,
        taker,
      });

      if (error || !data) {
        return {
          success: false,
          response: [
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Liquidity added successfully\n\n",
          "--------\n\n",
          `Hash: ${data.hash}\n\n`,
          `Pair Address: ${data.pairAddress}\n\n`,
          `Dex: ${data.dex}\n\n`,
        ].join(" "),
      };
    }

    case "/mgs": {
      const [, settingId] = args.map((i) =>
        i.trim().replace(/\t/g, "").replace(/\n/g, "")
      );

      const [data, error] = await CoinService.getSettings(settingId);

      if (error || !data) {
        return {
          success: false,
          response: [
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      const mapType: Record<string, any> = {
        QUICK_SWAP: {
          title: "Quick Swap",
          key: "quickSwapSetting",
        },
        QUICK_BUY: {
          title: "Quick Buy",
          key: "quickBuySetting",
        },
        QUICK_SELL: {
          title: "Quick Sell",
          key: "quickSellSetting",
        },
      };

      return {
        success: true,
        response: [
          "Meme coin settings:\n\n",
          "-----------\n\n",
          `Type: ${mapType[data.type].title}\n\n`,
          `Account ID: ${data.accountId}\n\n`,
          `Chain ID: ${data.chainId}\n\n`,
          `Min Amount: ${data[mapType[data.type].key].minAmount}\n\n`,
          `Max Amount: ${data[mapType[data.type].key].maxAmount}\n\n`,
          `Quick Slippage: ${data[mapType[data.type].key].slippage}\n\n`,
          `Slippage: ${data.slippage}\n\n`,
          `Token 0: ${data.token0}\n\n`,
          `Token 1: ${data.token1}\n\n`,
          `Target Price: ${data.targetPrice}\n\n`,
          `Current Price: ${data.currentPrice}\n\n`,
          `Target Volume: ${data.targetVolume}\n\n`,
          `Run ID: ${data.runId}\n\n`,
          `Status: ${data.status}\n\n`,
          `Min Delay: ${data.minDelay}\n\n`,
          `Max Delay: ${data.maxDelay}\n\n`,
          `Issue Date: ${new Date(data.createdAt).toDateString()}\n\n`,
          `Last updated date: ${new Date(data.updatedAt).toDateString()}\n\n`,
          `Wallets:\n\n`,
          ...data.wallets.map((w: string) => `• ${w}\n\n`),
        ].join(" "),
      };
    }

    case "/mw": {
      const [data, error] = await CoinService.createWallet();

      if (error || !data?.[0]) {
        return {
          success: false,
          response: [
            "Wallet created fail: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Wallet created successfully\n\n",
          `Address: ${data[0].address}\n\n`,
          `Private Key: ${data[0].privateKey}\n\n`,
          `Mnemonic: ${data[0].mnemonic}\n\n`,
        ].join(" "),
      };
    }

    case "/msendtoken": {
      if (args.length !== 5) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mSendToken <address> <amount> <privateKey> <wallet1>,<wallet2>,<wallet3>,...",
          ].join(" "),
        };
      }

      const [, address, amount, privateKey, wallets] = args.map((i) =>
        i.trim().replace(/\t/g, "").replace(/\n/g, "")
      );

      const [data, error] = await CoinService.sendTokens({
        address,
        amount: +amount,
        privateKey,
        wallets: wallets.split(","),
      });

      if (error) {
        return {
          success: false,
          response: [
            "Meme coin send failed: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: ["Meme coin send successfully\n\n"].join(" "),
      };
    }

    case "/mm": {
      if (args.length !== 12) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mm <accountId> <slippage> <token0> <token1> <type> <chainId> <minAmount> <maxAmount> <targetPrice> <minDelay> <maxDelay>",
          ].join(" "),
        };
      }

      const [
        ,
        accountId,
        slippage,
        token0,
        token1,
        type,
        chainId,
        minAmount,
        maxAmount,
        targetPrice,
        minDelay,
        maxDelay,
      ] = args.map((i) => i.trim().replace(/\t/g, "").replace(/\n/g, ""));

      const [data, error] = await CoinService.settings({
        accountId,
        token0,
        token1,
        type,
        chainId: +chainId,
        minAmount: +minAmount,
        maxAmount: +maxAmount,
        slippage: +slippage,
        targetPrice: +targetPrice || 5,
        minDelay: +minDelay || 10,
        maxDelay: +maxDelay || 50,
      });

      if (error) {
        return {
          success: false,
          response: [
            "Meme coin setting failed: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: ["Setting updated\n\n"].join(" "),
      };
    }

    case "/mtokendetail": {
      if (args.length !== 2) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mTokenDetail <address>",
          ].join(" "),
        };
      }

      const [, address] = args;

      const [data, error] = await CoinService.getToken({
        address: address.replace(/\n/g, "").replace(/\t/g, ""),
      });

      if (error) {
        return {
          success: false,
          response: [
            "Token list failed: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      if (!data) {
        return {
          success: true,
          response: ["No tokens found"].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Token detail:\n\n",
          `Address: ${data.address}\n\n`,
          `Name: ${data.name}\n\n`,
          `Symbol: ${data.symbol}\n\n`,
          `Decimals: ${data.decimals}\n\n`,
          `Total Supply: ${data.totalSupply}\n\n`,
          `Hash: ${data.createdHash}\n\n`,
          `Issue Date: ${new Date(data.createdAt).toDateString()}\n\n`,
        ].join(" "),
      };
    }

    case "/mlisttokens": {
      if (args.length !== 4) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mListTokens <address> <name> <symbol>",
          ].join(" "),
        };
      }

      const [, address, name, symbol] = args;

      const [data, error] = await CoinService.listTokens({
        address: address.replace(/\n/g, "").replace(/\t/g, ""),
        name: name.replace(/\n/g, "").replace(/\t/g, ""),
        symbol: symbol.replace(/\n/g, "").replace(/\t/g, ""),
      });

      if (error) {
        return {
          success: false,
          response: [
            "Token list failed: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      if (!data?.tokens?.length) {
        return {
          success: true,
          response: ["No tokens found"].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "List tokens:\n\n",
          ...data.tokens.map((token) => [
            "------------\n\n",
            `Address: ${token.address}\n\n`,
            `Name: ${token.name}\n\n`,
            `Symbol: ${token.symbol}\n\n`,
            `Decimals: ${token.decimals}\n\n`,
            `Total Supply: ${token.totalSupply}\n\n`,
            `Hash: ${token.createdHash}\n\n`,
            `Issue Date: ${new Date(token.createdAt).toDateString()}\n\n`,
          ]),
        ]
          .flat()
          .join(" "),
      };
    }

    case "/mswap": {
      if (args.length !== 6) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mSwap <chainId> <sellToken> <buyToken> <sellAmount> <slippageBps>",
          ].join(" "),
        };
      }

      const [, chainId, sellToken, buyToken, sellAmount, slippageBps] = args;

      const [data, error] = await CoinService.swapToken({
        chainId: Number(chainId),
        sellAmount: Number(sellAmount),
        slippageBps: Number(slippageBps),
        sellToken,
        buyToken,
      });

      if (error) {
        return {
          success: false,
          response: [
            "Uniswap token create failed: ",
            error || "Internal server error. Please try again later",
          ].join(" "),
        };
      }
      return {
        success: true,
        response: [
          "Token Swapped.\n\n",
          "------------\n\n",
          `Transaction Hash: ${data.transactionHash}\n\n`,
        ].join(" "),
      };
    }

    case "/mcreatev3": {
      if (args.length !== 7) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mCreate <name> <token> <supply> <tokenAddress> <tokenAmount> <initialAmount>",
          ].join(" "),
        };
      }

      const [
        _,
        name,
        symbol,
        totalSupply,
        liqTokenAddress,
        liqTokenAmount,
        initialAmount,
      ] = args;

      const data = await CoinService.createUniSwapToken({
        name,
        symbol,
        totalSupply: Number(totalSupply),
        liqTokenAddress,
        liqTokenAmount: Number(liqTokenAmount),
        initialAmount: Number(initialAmount),
      });

      if (typeof data === "string" || !data.transaction) {
        return {
          success: false,
          response: [
            "Uniswap token create failed: ",
            data || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Meme coin created.\n\n",
          `Name: ${name}\n\n`,
          `Token: ${symbol}\n\n`,
          `Total Supply: ${totalSupply}\n\n`,
          `Transaction: ${data.transaction}\n\n`,
        ].join(" "),
      };
    }

    case "/mcreate": {
      if (args.length !== 4) {
        return {
          success: false,
          response: [
            "Invalid command format.",
            "Please use: /mCreate <name> <token> <supply>",
          ].join(" "),
        };
      }

      const [_, name, symbol, totalSupply] = args;

      const data = await CoinService.createToken({
        name,
        symbol,
        totalSupply: Number(totalSupply),
      });

      if (typeof data === "string" || !data.address) {
        return {
          success: false,
          response: [
            "Meme coin create failed: ",
            data || "Internal server error. Please try again later",
          ].join(" "),
        };
      }

      return {
        success: true,
        response: [
          "Meme coin created.\n\n",
          `Name: ${name}\n\n`,
          `Token: ${symbol}\n\n`,
          `Total Supply: ${totalSupply}\n\n`,
          `Address: ${data.address}\n\n`,
          `TxHash: ${data.txHash}\n\n`,
        ].join(" "),
      };
    }

    default:
      return {
        success: false,
        response: "Unknown command. Type /help for available commands.",
      };
  }
};

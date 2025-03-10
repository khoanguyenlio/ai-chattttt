import type { HTTP_METHOD } from "next/dist/server/web/http";
import { Client } from "undici";

const coinServiceClient = new Client(
  String(process.env.COIN_WORKFLOW_BASE_URL)
);

type Result<T = any, E = string> = [T, null] | [null, E];

export enum SettingType {
  QUICK_SWAP = "QUICK_SWAP",
  QUICK_SELL = "QUICK_SELL",
  QUICK_BUY = "QUICK_BUY",
}

export default class CoinService {
  private static async request<Res = any>(
    method: HTTP_METHOD,
    path: string,
    options?: { body?: object; query?: object }
  ) {
    const response = await coinServiceClient.request({
      path,
      method,
      headers: {
        "x-api-key": process.env.COIN_WORKFLOW_API_KEY,
        "Content-Type": "application/json",
      },
      ...(options?.body && {
        body: JSON.stringify(options.body),
      }),
      ...(options?.query && {
        query: options.query,
      }),
    });

    const data = <Res>await response.body.json();

    return { data };
  }

  static async createToken(body: {
    name: string;
    symbol: string;
    totalSupply: number;
  }) {
    try {
      const { data } = await this.request<{
        address: string;
        txHash: string;
      }>("POST", "/api/v1/tokens", { body });

      return data;
    } catch (error) {
      console.log("error", error);

      return "Internal server error. Please try again later";
    }
  }

  static async createUniSwapToken(body: {
    name: string;
    symbol: string;
    liqTokenAddress: string;
    totalSupply: number;
    liqTokenAmount: number;
    initialAmount: number;
  }) {
    try {
      const { data } = await this.request<{
        transaction: string;
      }>("POST", "/api/v1/workflows/create-and-list", { body });

      return data;
    } catch (error) {
      console.log("error", error);

      return "Internal server error. Please try again later";
    }
  }

  static async swapToken(body: {
    chainId: number;
    sellAmount: number;
    slippageBps: number;
    buyToken: string;
    sellToken: string;
  }) {
    try {
      const { data } = await this.request<any>(
        "POST",
        "/api/v1/workflows/swap",
        { body }
      );

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async listTokens(query: {
    address: string;
    name: string;
    symbol: string;
  }): Promise<
    Result<
      {
        tokens: {
          decimals: number;
          totalSupply: number;
          address: string;
          name: string;
          symbol: string;
          createdHash: string;
          createdAt: string;
          updatedAt: string;
          id: string;
        }[];
      },
      string
    >
  > {
    try {
      const { data } = await this.request<any>("GET", "/api/v1/tokens", {
        query: {
          page: 1,
          size: 1000,
          ...query,
        },
      });

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async sendTokens(body: {
    amount: number;
    address: string;
    privateKey: string;
    wallets: string[];
  }): Promise<Result<any, string>> {
    try {
      const { data } = await this.request<{
        name: string;
        symbol: string;
        totalSupply: number;
        statusCode: number;
      }>("POST", "/api/v1/tokens/send", {
        body,
      });

      if (data.statusCode === 500) {
        throw data;
      }

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async createWallet(): Promise<
    Result<
      Array<{
        address: string;
        privateKey: string;
        mnemonic: string;
      }>
    >
  > {
    try {
      const { data } = await this.request("POST", "/api/v1/wallets");

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async settings(body: {
    accountId: string;
    token0: string;
    token1: string;
    type: string;
    chainId: number;
    minAmount: number;
    maxAmount: number;
    slippage: number;
    targetPrice?: number;
    minDelay?: number;
    maxDelay?: number;
  }): Promise<
    Result<
      {
        tokens: {
          decimals: number;
          totalSupply: number;
          address: string;
          name: string;
          symbol: string;
          createdHash: string;
          createdAt: string;
          updatedAt: string;
          id: string;
        }[];
      },
      string
    >
  > {
    try {
      const { minAmount, maxAmount, slippage, type, ...rest } = body;

      const rawSettingType = type.toLowerCase().replace(/_/g, "");

      if (
        !["quickbuy", "buy", "quicksell", "sell", "quickswap", "swap"].includes(
          rawSettingType
        )
      ) {
        return [null, "Invalid setting type. Available type: Buy, Sell, Swap"];
      }

      const settingType = ["quickbuy", "buy"].includes(type)
        ? SettingType.QUICK_BUY
        : ["quicksell", "sell"].includes(type)
        ? SettingType.QUICK_SELL
        : SettingType.QUICK_SWAP;

      const settingByType: Record<SettingType, string> = {
        [SettingType.QUICK_SELL]: "quickSellSetting",
        [SettingType.QUICK_BUY]: "quickBuySetting",
        [SettingType.QUICK_SWAP]: "quickSwapSetting",
      };

      const { data } = await this.request<any>("POST", "/api/v1/mm-settings", {
        body: {
          ...rest,
          type: settingType,
          [settingByType[settingType]]: {
            minAmount,
            maxAmount,
            slippage,
          },
        },
      });

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async getToken(query: { address: string }): Promise<
    Result<
      {
        decimals: number;
        totalSupply: number;
        address: string;
        name: string;
        symbol: string;
        createdHash: string;
        createdAt: string;
        updatedAt: string;
        id: string;
      },
      string
    >
  > {
    try {
      const { data } = await this.request<any>(
        "GET",
        `/api/v1/tokens/${query.address}`
      );

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async getSettings(settingId: string): Promise<Result> {
    try {
      const { data } = await this.request(
        "GET",
        `/api/v1/mm-settings/${settingId}`
      );

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async addLiquidity(body: {
    chainId: number;
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
    taker: string;
  }): Promise<Result> {
    try {
      const { data } = await this.request(
        "POST",
        `/api/v1/workflows/uni-v2/liquidity`,
        { body }
      );

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async getQuote(params: {
    chainId: number;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    slippageBps: string;
  }): Promise<Result> {
    try {
      const { data } = await this.request("GET", `/api/v1/workflows/quote`, {
        query: {
          ...params,
          "x-api-key": String(process.env.COIN_WORKFLOW_BASE_URL),
        },
      });

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }

  static async getPrice(params: {
    chainId: number;
    sellToken: string;
    buyToken: string;
    slippageBps: string;
  }): Promise<Result> {
    try {
      const { data } = await this.request("GET", `/api/v1/workflows/price`, {
        query: {
          ...params,
          "x-api-key": String(process.env.COIN_WORKFLOW_BASE_URL),
        },
      });

      return [data, null];
    } catch (error) {
      console.log("error", error);

      return [null, "Internal server error. Please try again later"];
    }
  }
}

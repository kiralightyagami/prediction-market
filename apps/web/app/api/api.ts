import axios from "axios";

const URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export const api = {
  getMarkets: async () => {
    const response = await axios.get(`${URL}/markets`);
    return response.data;
  },

  getMarket: async (marketId: string) => {
    const response = await axios.get(`${URL}/market`, {
      params: { marketId },
    });
    return response.data;
  },
  getBalance: async (token: string) => {
    const response = await axios.get(`${URL}/balance`, {
      headers: { Authorization: token },
    });
    return response.data;
  },

  getPositions: async (token: string) => {
    const response = await axios.get(`${URL}/positions`, {
      headers: { Authorization: token },
    });
    return response.data;
  },

  getOrderHistory: async (token: string) => {
    const response = await axios.post(
      `${URL}/history`,
      {},
      {
        headers: { Authorization: token },
      },
    );
    return response.data;
  },
  placeOrder: async (
    token: string,
    orderData: {
      marketId: string;
      type: "buy" | "sell";
      side: "yes" | "no";
      price: number;
      qty: number;
    },
  ) => {
    const response = await axios.post(`${URL}/order`, orderData, {
      headers: { Authorization: token },
    });
    return response.data;
  },

  mergePosition: async (
    token: string,
    data: {
      marketId: string;
      amount: number;
    },
  ) => {
    const response = await axios.post(`${URL}/merge`, data, {
      headers: { Authorization: token },
    });
    return response.data;
  },

  splitPosition: async (
    token: string,
    data: {
      marketId: string;
      amount: number;
    },
  ) => {
    const response = await axios.post(`${URL}/split`, data, {
      headers: { Authorization: token },
    });
    return response.data;
  },

  onramp: async (token: string, amount: number) => {
    const response = await axios.post(
      `${URL}/onramp`,
      { amount },
      {
        headers: { Authorization: token },
      },
    );
    return response.data;
  },

  offramp: async (token: string, amount: number) => {
    const response = await axios.post(
      `${URL}/offramp`,
      { amount },
      {
        headers: { Authorization: token },
      },
    );
    return response.data;
  },
};

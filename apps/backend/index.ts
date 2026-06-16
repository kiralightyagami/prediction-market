import express from "express";
import cors from "cors";
import { prisma } from "db";
import { CreateOrderSchema, type Orderbook } from "./types";

const app = express();

app.use(express.json());

app.use(cors());

//todo add auth middleware

app.post("/buy", async (req, res) => {
  const { success, data } = CreateOrderSchema.safeParse(req.body);
  const userId = "1"; // add auth middleware and fetch user id
  if (!success) {
    res.status(411).json({
      message: "Incorrect input",
    });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const response = await tx.$queryRaw<
      {
        yesOrderbook: string;
        noOrderbook: string;
        id: string;
        totalQty: number;
      }[]
    >`SELECT * FROM "Market" WHERE id =${data.marketId} FOR UPDATE;`;
    const userResponse = await tx.$queryRaw<
      { id: string; address: string; usdBalance: number }[]
    >`SELECT * FROM "User" WHERE id =${userId} FOR UPDATE;`;
    const market = response[0];
    const user = userResponse[0];

    if (!user) {
      return;
    }

    if (!market) {
      return;
    }

    const yesOrderbook: Orderbook = JSON.parse(market.yesOrderbook);
    const noOrderbook: Orderbook = JSON.parse(market.noOrderbook);

    if (data.side == "yes" && data.type == "buy"){
      const usd = data.qty * data.price;
      if (user.usdBalance < usd) {
        res.status(403).json({
          message: "not enough balance",
        });
        return;
      }

      let leftQty = data.qty;

      const prices = Object.keys(yesOrderbook).sort(
        (a: string, b: string) => Number(a) - Number(b),
      );

      await Promise.all(
        prices.map(async (price) => {
          if (Number(price) > data.price) {
            return;
          }
          const { availableQty, orders } = yesOrderbook[price]!;

          await Promise.all(
            orders.map(async (order) => {
            const matchedQty = order.qty >= leftQty ? leftQty : order.qty; 
                await prisma.position.update({
                  where: {
                    userId_marketId_type: {
                      userId: order.userId,
                      marketId: data.marketId,
                      type: "Yes",
                    },
                  },
                  data: {
                    qty: {
                      decrement: matchedQty,
                    },
                  },
                });

                await prisma.user.update({
                  where: {
                    id: order.userId,
                  },
                  data: {
                    usdBalance: {
                      increment: Number(price) * matchedQty,
                    },
                  },
                });

                await prisma.position.update({
                  where: {
                    userId_marketId_type: {
                      userId,
                      marketId: data.marketId,
                      type: "Yes",
                    },
                  },
                  data: {
                    qty: {
                      increment: matchedQty,
                    },
                  },
                });

                await prisma.user.update({
                  where: {
                    id: userId,
                  },
                  data: {
                    usdBalance: {
                      decrement: Number(price) * matchedQty,
                    },
                  },
                });

                leftQty -= matchedQty;

            }),
          );
        }),
      );
    }

    if (data.side == "yes" && data.type == "sell"){

    }
  });
});

app.post("/sell", (req, res) => {});

app.post("/split", (req, res) => {});

app.post("/merge", (req, res) => {});

app.get("/balance", (req, res) => {});

app.get("/position", (req, res) => {});

app.post("/history", (req, res) => {});

app.listen(8080);

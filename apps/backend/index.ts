import express from "express";
import cors from "cors";
import { uuid } from "uuidv4";
import { prisma } from "db";
import {
  CreateOrderSchema,
  MergeSchema,
  SplitSchema,
  type Orderbook,
} from "./types";

const app = express();

app.use(express.json());

app.use(cors());

//todo add auth middleware

app.post("/order", async (req, res) => {
  const { success, data } = CreateOrderSchema.safeParse(req.body);
  const userId = "1"; // add auth middleware and fetch user id
  if (!success) {
    res.status(411).json({
      message: "Incorrect input",
    });
    return;
  }

  const originalOrderId = uuid();
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

    if (data.side == "yes" && data.type == "buy") {
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
      // just do one bulk update rather than all this data calls
      await Promise.all(
        prices.map(async (price) => {
          if (Number(price) > data.price) {
            return;
          }
          const { orders } = yesOrderbook[price]!;

          await Promise.all(
            orders.map(async (order) => {
              const matchedQty = order.qty >= leftQty ? leftQty : order.qty;
              const reverseOrder = order.reverseOrder;
              if (!reverseOrder) {
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
              } else {
                await prisma.position.update({
                  where: {
                    userId_marketId_type: {
                      userId: order.userId,
                      marketId: data.marketId,
                      type: "No",
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
                    id: order.userId,
                  },
                  data: {
                    usdBalance: {
                      decrement: (100 - Number(price)) * matchedQty,
                    },
                  },
                });
              }

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
              order.filledQty += matchedQty;
              yesOrderbook[price]!.availableQty -= matchedQty;
            }),
          );
        }),
      );

      if (leftQty) {
        const oppositePrice = 100 - data.price;
        if (!noOrderbook[oppositePrice]) {
          noOrderbook[oppositePrice] = { availableQty: 0, orders: [] };
        }

        noOrderbook[oppositePrice]!.availableQty += leftQty;
        noOrderbook[oppositePrice]!.orders.push({
          qty: leftQty,
          userId,
          filledQty: 0,
          originalOrderId: originalOrderId,
          reverseOrder: true,
        });
      }
    }

    if (data.side == "yes" && data.type == "sell") {
      const buyPrice = 100 - data.price;
      const buyQty = data.qty;

      const userPosition = await prisma.position.findFirst({
        where: {
          userId: userId,
          marketId: data.marketId,
          type: "Yes",
        },
      });

      if (!userPosition) {
        return;
      }

      if (userPosition.qty < data.qty) {
        return;
      }

      let leftQty = data.qty;

      const prices = Object.keys(noOrderbook).sort(
        (a: string, b: string) => Number(a) - Number(b),
      );
      // just do one bulk update rather than all this data calls
      await Promise.all(
        prices.map(async (price) => {
          if (Number(price) > buyPrice) {
            return;
          }
          const { orders } = noOrderbook[price]!;

          await Promise.all(
            orders.map(async (order) => {
              const matchedQty = order.qty >= leftQty ? leftQty : order.qty;
              const reverseOrder = order.reverseOrder;
              if (!reverseOrder) {
                await prisma.position.update({
                  where: {
                    userId_marketId_type: {
                      userId: order.userId,
                      marketId: data.marketId,
                      type: "No",
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
              } else {
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
                      increment: matchedQty,
                    },
                  },
                });

                await prisma.user.update({
                  where: {
                    id: order.userId,
                  },
                  data: {
                    usdBalance: {
                      decrement: (100 - Number(price)) * matchedQty,
                    },
                  },
                });
              }

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
                    decrement: matchedQty,
                  },
                },
              });

              await prisma.user.update({
                where: {
                  id: userId,
                },
                data: {
                  usdBalance: {
                    increment: Number(price) * matchedQty,
                  },
                },
              });

              leftQty -= matchedQty;
              order.filledQty += matchedQty;
              noOrderbook[price]!.availableQty -= matchedQty;
            }),
          );
        }),
      );

      if (leftQty) {
        if (!yesOrderbook[data.price]) {
          yesOrderbook[data.price] = { availableQty: 0, orders: [] };
        }

        yesOrderbook[data.price]!.availableQty += leftQty;
        yesOrderbook[data.price]!.orders.push({
          qty: leftQty,
          userId,
          filledQty: 0,
          originalOrderId: originalOrderId,
          reverseOrder: true,
        });
      }
    }

    // todo complete no checks

    tx.market.update({
      data: {
        yesOrderbook: JSON.stringify(yesOrderbook),
        noOrderbook: JSON.stringify(noOrderbook),
      },
      where: {
        id: data.marketId,
      },
    });
  });
});

app.post("/split", async (req, res) => {
  const { data, success } = SplitSchema.safeParse(req.body);
  const userId: string = "1"; //use auth middleware and fetch userid

  if (!success) {
    res.status(411).json({
      message: "not valid inputs",
    });
    return;
  }
  const marketId = data?.marketId;
  await prisma.$transaction(async (tx) => {
    const userResponse = await tx.$queryRaw<
      { id: string; address: string; usdBalance: number }[]
    >`SELECT * FROM "User" WHERE id=${userId} FOR UPDATE;`;
    const user = userResponse[0];

    if (!user) {
      return;
    }

    if (user.usdBalance < data.amount) {
      res.status(403).json({
        message: "you are not allowed",
      });
      return;
    }

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        usdBalance: {
          decrement: data.amount,
        },
      },
    });

    await tx.position.upsert({
      where: {
        userId_marketId_type: {
          marketId,
          userId,
          type: "Yes",
        },
      },
      create: {
        marketId,
        userId,
        type: "Yes",
        qty: data.amount,
      },
      update: {
        qty: {
          increment: data.amount,
        },
      },
    });

    await tx.position.upsert({
      where: {
        userId_marketId_type: {
          marketId,
          userId,
          type: "No",
        },
      },
      create: {
        marketId,
        userId,
        type: "No",
        qty: data.amount,
      },
      update: {
        qty: {
          increment: data.amount,
        },
      },
    });
  });
});

app.post("/merge", async (req, res) => {
  const { data, success } = MergeSchema.safeParse(req.body);
  const userId: string = "1"; //use auth middleware and fetch userid

  if (!success) {
    res.status(411).json({
      message: "not valid inputs",
    });
    return;
  }
  const marketId = data?.marketId;
  await prisma.$transaction(async (tx) => {
    const userResponse = await tx.$queryRaw<
      { id: string; address: string; usdBalance: number }[]
    >`SELECT * FROM "User" WHERE id=${userId} FOR UPDATE;`;
    const user = userResponse[0];

    if (!user) {
      return;
    }

    const yesPosition = await tx.position.findFirst({
      where: {
        userId,
        marketId,
        type: "Yes",
      },
    });

    const noPosition = await tx.position.findFirst({
      where: {
        userId,
        marketId,
        type: "No",
      },
    });

    if (!yesPosition || yesPosition.qty < data.amount) {
      return;
    }

    if (!noPosition || noPosition.qty < data.amount) {
      return;
    }

    await tx.position.update({
      where: {
        userId_marketId_type: {
          userId,
          marketId,
          type: "Yes",
        },
      },
      data: {
        qty: {
          decrement: data.amount,
        },
      },
    });

    await tx.position.update({
      where: {
        userId_marketId_type: {
          userId,
          marketId,
          type: "No",
        },
      },
      data: {
        qty: {
          decrement: data.amount,
        },
      },
    });

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        usdBalance: {
          increment: data.amount,
        },
      },
    });

    await tx.orderHistory.create({
      data: {
        orderType: "Merge",
        userId,
        price: 0,
        qty: data.amount,
        marketId: data.marketId,
      },
    });

    res.json({
      message: "Merge done",
    });
  });
});

app.get("/balance", (req, res) => {});

app.get("/position", (req, res) => {});

app.post("/history", (req, res) => {});

app.listen(8080);

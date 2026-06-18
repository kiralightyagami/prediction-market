import { createClient } from "@supabase/supabase-js";
import { prisma } from "db";
import type { NextFunction, Request, Response } from "express";
const supabase = createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_SECRET_KEY!
);


export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        const address: string = user?.user_metadata.custom_claims.address;
        const userDb = await prisma.user.upsert({
            where: {
                address,
            },
            update: {
                address,
            },
            create: {
                address,
                usdBalance: 0
            }
        })
        if (address) {
            req.userId = userDb.id;
            next();
        } else {
            res.status(403).json({
                message: "Incorrect credentials"
            })
        }
    } catch(e) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

}
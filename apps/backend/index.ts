import express from "express";
import cors from "cors";
import { prisma } from "db";

const app = express();

app.use(express.json());

app.use(cors());

//todo add auth middleware

app.post("/buy", (req,res) => {

});

app.post("/sell", (req,res) => {

});

app.post("/split", (req,res) => {

});

app.post("/merge", (req,res) => {

});

app.get("/balance", (req,res) => {

});

app.get("/position", (req,res) => {

});

app.post("/history", (req,res) => {

});

app.listen(8080);
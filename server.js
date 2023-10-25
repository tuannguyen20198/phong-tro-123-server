import express from "express";
require("dotenv").config();
import cors from "cors";
const app = express();
import initRoutes from "./src/routes";
import connectDatabase from "./src/config/connectDatabase";
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);
app.use(express.json({limit:'10mb'}));

app.use(express.urlencoded({extended: true , limit:'10mb'}));
connectDatabase();
initRoutes(app);
app.use("/", (req, res) => {
  res.send("server on ...");
});

const port = process.env.PORT || 8888;
const listener = app.listen(port, () => {
  console.log(`Server is running on the port ${listener.address().port}`);
});

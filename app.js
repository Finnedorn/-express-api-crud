const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const postRouter = require('./router/postsRouter');

app.use(express.json());

app.use("/posts", postRouter);

app.listen(port, () => {
    console.log(`Sto runnando il server sulla porta: ${port}`);
});

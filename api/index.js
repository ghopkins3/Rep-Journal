import express from "express";

const app = express();

app.use("/",  (req, res) => {
    res.send("server is running, better go catch it.");
});

app.listen(3000, console.log("Server started on PORT 3000"));

export default app;
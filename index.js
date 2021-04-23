const express = require("express");
const cors = require("cors");

const app = express();
// http server for sockets
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const User = require("./models/User");

const aiRouter = require("./routes/ai");
const matchmakingRouter = require("./routes/matchmaking");

app.use("/api/ai", aiRouter);
app.use("/api/matchmaking", matchmakingRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const router = express.Router();
const { findPartner, addUserToQueue, removeUserFromQueue } = require("../matchmaking");

// POST /api/matchmaking/join
router.post("/join", (req, res) => {
  const { userId, nativeLanguage, learningLanguage, socketId } = req.body;
  const user = { userId, nativeLanguage, learningLanguage, socketId };

  const partner = findPartner(user);
  if (partner) {
    removeUserFromQueue(partner.userId);
    res.json({ matched: true, partner });
  } else {
    addUserToQueue(user);
    res.json({ matched: false });
  }
});

// POST /api/matchmaking/leave
router.post("/leave", (req, res) => {
  removeUserFromQueue(req.body.userId);
  res.json({ left: true });
});

module.exports = router;
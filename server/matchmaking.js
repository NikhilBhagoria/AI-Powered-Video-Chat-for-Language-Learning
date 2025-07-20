const waitingUsers = []; // { userId, nativeLanguage, learningLanguage, socketId }

function findPartner(user) {
  return waitingUsers.find(
    u =>
      u.learningLanguage === user.nativeLanguage &&
      u.nativeLanguage === user.learningLanguage &&
      u.userId !== user.userId
  );
}

function addUserToQueue(user) {
  waitingUsers.push(user);
}

function removeUserFromQueue(userId) {
  const idx = waitingUsers.findIndex(u => u.userId === userId);
  if (idx > -1) waitingUsers.splice(idx, 1);
}

module.exports = { findPartner, addUserToQueue, removeUserFromQueue };
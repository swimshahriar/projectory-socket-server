const io = require("socket.io")(9000, {
  cors: {
    origin: "*",
  },
});

// ---------------------- socket functions --------------------------
let users = [];

// ------------------- helper functions --------------
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

// ------------------ socket connection -----------------
io.on("connection", (socket) => {
  // on connect
  console.log("new user connected!");

  // take user and socket id from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    if (user?.socketId) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    }
  });

  // on disconnect remove user
  socket.on("disconnect", () => {
    console.log("a user left!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

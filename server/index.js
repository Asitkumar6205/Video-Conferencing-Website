const { Server } = require("socket.io");

const io = new Server(8000, {
    cors: true
});

const emailToSocketIdMap = new Map();
const SocketIdToemailMap = new Map();

io.on('connection', socket => {
    console.log('Socket Connected', socket.id);
    socket.on("room:join", data => {
        console.log(data);
        emailToSocketIdMap.set(email, socket.id);
        emailToSocketIdMap.set(socket.id, email);
        socket.to(socket.id).emit("room:join", data);
    })

}); 



const { userJoin, getRoomUsers, getCurrentUser, userLeave } = require("./msg/users");
const formateMessage = require("./msg/messages");

let chat=(socket,io)=>{
  
    console.log("One user has joined");

    socket.on("joinRoom", ({ username, room }) => {
      const roomUsers = getRoomUsers(room);
    
      if (roomUsers.length < 2) {
        const user = userJoin(socket.id, username, room);
     
        socket.join(user.room);
    
        // socket.emit(
        //   "message",
        //   formateMessage("Masai Server", "Welcome to masai Server")
        // );

        socket.broadcast
          .to(user.room)
          .emit(
            "message",
            formateMessage("", `${username} has joined`)
          );
    
        io.to(room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });


        
     socket.on("chatMessage",(msg)=>{
        console.log(msg)
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit("message",formateMessage(user.username,msg));

   });


    
   socket.on("disconnect",()=>{

      const user = userLeave(socket.id);
          console.log("one user left");
  

         io.to(user.room).emit("message",formateMessage("Masai Server",`${user.username} has left the chat`));
   
         // getting room users.
    io.to(user.room).emit("roomUsers",{
      room:user.room,
      users:getRoomUsers(user.room)
   })
   
          })
  

      } else {
        // if room is full, emit an error message to the client
        socket.emit(
          "errorMessage",
          "Sorry, this room is already full. Please try another room."
        );
      }
    });

}

module.exports={chat}



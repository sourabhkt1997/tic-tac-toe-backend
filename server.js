let express=require("express")
let app=express()
let http=require("http")
let socketio=require("socket.io")
let server=http.createServer(app)
let io=socketio(server)
let{chat}=require("./chat")
let {connection}=require("./db")
require("dotenv").config()
app.use(express.json())
let {userrouter}=require("./router/userrouter")
let cookieparser=require("cookie-parser")
app.use(cookieparser())
const cors = require('cors')
app.use(cors())


let matrix=[]
for(let i=0;i<3;i++){
    let arr=new Array(3).fill(null)
    matrix.push(arr)
} 

let gamestatus={
    player:[],
    board:matrix,
    nextplayer:"",
    win:null,
    winnerdata:[],
    winningline:[]
   }

   function rejectsameplayer(data){
    if(gamestatus.player.length==0){
        return true
    }
    else{
    for(let i=0;i<gamestatus.player.length;i++){
        if(gamestatus.player[i].name==data.username){
            return false
        }
        }
    }
     return true
   }

io.on("connection",(socket)=>{
    console.log("player connected to"+socket.id)
     
    socket.on("users",(data)=>{
        console.log(data)
       
        if(gamestatus.player.length<2 &&rejectsameplayer(data)){
        gamestatus.player.push({
            id:socket.id,
            name:data.username,
            room:data.room,
            symbol:gamestatus.player[0] ?"o":"x"
        })
        }
      
        if(gamestatus.player.length==2 && gamestatus.player[0].room==gamestatus.player[1].room){
            gamestatus.nextplayer=gamestatus.player[0].name
            io.emit("gameBegins","gameBegins")
        }
    
        io.emit("game",gamestatus)
    }) 
     
    
   
    socket.on("clicked",(data)=>{
        
        //finding nextplayer
        if(data[1]==gamestatus.nextplayer){
           
            let filter=gamestatus.player.filter((ele)=>{
             return ele.name!=data[1]
            })
            console.log(filter,"filter")
            gamestatus.nextplayer=filter[0].name
              
            }
        
        // adding the clied user to the gae board
        if(data[0]=="cell-1"){
            gamestatus.board[0][0]=data[1]
        }
        else if(data[0]=="cell-2"){
            gamestatus.board[0][1]=data[1]
        }
        else if(data[0]=="cell-3"){
            gamestatus.board[0][2]=data[1]
        }
        else if(data[0]=="cell-4"){
            gamestatus.board[1][0]=data[1]
        }
        else if(data[0]=="cell-5"){
            gamestatus.board[1][1]=data[1]
        }
        else if(data[0]=="cell-6"){
            gamestatus.board[1][2]=data[1]
        }
        else if(data[0]=="cell-7"){
            gamestatus.board[2][0]=data[1]
        }
        else if(data[0]=="cell-8"){
            gamestatus.board[2][1]=data[1]
        }
        else if(data[0]=="cell-9"){
            gamestatus.board[2][2]=data[1]
        }
        
        // checking draw or not
        function checkdraw(){
            let count=0
            for(let i=0;i<3;i++){
                for(let j=0;j<3;j++){
                    if(gamestatus.board[i][j]){
                        count++
                    }
                }
            }
            if(count==9){
                return true
            }
        }
       //checking winner
        function checkwin(){

        for(let i=0;i<3;i++){
            if((gamestatus.board[i][0]==gamestatus.board[i][1] && gamestatus.board[i][1]==gamestatus.board[i][2]) && gamestatus.board[i][0] !=null  && gamestatus.board[i][1] !=null && gamestatus.board[i][1] !=null){
               gamestatus.winningline.push([i,0],[i,1],[i,2])
                return true
            }
        }
        console.log()
        for(let i=0;i<3;i++){
            if((gamestatus.board[0][i]==gamestatus.board[1][i] && gamestatus.board[1][i]== gamestatus.board[2][i]) && gamestatus.board[0][i] !=null  && gamestatus.board[1][i] !=null && gamestatus.board[2][i] !=null){
                gamestatus.winningline.push([0,i],[1,i],[2,i])
                return true
            }
        }
      
         if((gamestatus.board[0][0]==gamestatus.board[1][1] &&gamestatus.board[1][1]== gamestatus.board[2][2]) 
         && gamestatus.board[0][0]!==null && gamestatus.board[1][1]!==null && gamestatus.board[2][2]!==null){
            gamestatus.winningline.push([0,0],[1,1],[2,2])
            return true
         }
    
         if((gamestatus.board[0][2]==gamestatus.board[1][1] &&gamestatus.board[1][1]== gamestatus.board[2][0]) && gamestatus.board[0][2]!==null && gamestatus.board[1][1]!==null && gamestatus.board[2][0]!==null){
            gamestatus.winningline.push([0,2],[1,1],[2,0])
            return true
         }

         return false
       }

       if(checkwin()){
        let newmatrix=[]
        for(let i=0;i<3;i++){
            let arr=new Array(3).fill(null)
            newmatrix.push(arr)
        } 
        console.log(newmatrix)
        gamestatus.winnerdata.push(data[1])
        gamestatus.win=data[1]
        gamestatus.board=newmatrix
        io.emit("game",gamestatus)
       }
       else if(checkdraw()){
        let newmatrix=[]
        for(let i=0;i<3;i++){
            let arr=new Array(3).fill(null)
            newmatrix.push(arr)
        } 
        gamestatus.winnerdata.push("draw")
        gamestatus.win="draw"
        gamestatus.board=newmatrix
        io.emit("game",gamestatus)
       }
       else{
        io.emit("game",gamestatus)
       }
       console.log(gamestatus,"====")
        
      
    })

    socket.on("newround",(data)=>{
        console.log(data)
        gamestatus.win=data.win
        gamestatus.winningline=data.winningline
        // io.emit("game",gamestatus)
    })
     
    let g=55
    let newmatrx=[]
    for(let i=0;i<3;i++){
        let arr=new Array(3).fill(null)
        newmatrx.push(arr)
    } 

    socket.on("restart",(data)=>{
        gamestatus.player=data.player
        gamestatus.board=newmatrx
        gamestatus.nextplayer=data.player
        gamestatus.win=null
        gamestatus.winnerdata=[]
        gamestatus.winningline=[]
    })
    
     chat(socket,io)
   socket.on("disconnect",()=>{
    gamestatus.player=[]
    gamestatus.board=newmatrx
    gamestatus.nextplayer=""
    gamestatus.win=null
    gamestatus.winnerdata=[]
    gamestatus.winningline=[]
    console.log("disconnect")
   })
    
})




app.get('/', (req, res) => {
    res.send("Welcome to the Live X's And O's")
})

app.use("/user",userrouter)





server.listen(process.env.port, async (req, res) => {
    try {
        await connection;
        console.log('Server is connected to the Database.');
    } catch (err) {
        console.log('Server could not connect to the Database.');
    }
    console.log(`Server is listening to the port : ${process.env.port}.`);
})

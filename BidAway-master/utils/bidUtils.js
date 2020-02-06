const buildSocketFunctions = function buildSocketFunctions(io,bidDataApi){
   
    io.on('connection', function(socket) {
        
        socket.on("bidEvent",async function(data) {
            var resdata = await bidDataApi.addNewBid(data.id,data.price,data.user_id);
            io.sockets.emit('broadcast',resdata);
      });
        
        socket.on('disconnect', function () {
        });

      });
}

const startInterval = function startInterval(){
  const bidDataApi = require("../data/bids");
  setInterval(() => {
    bidDataApi.bidWinnerUpdate();
  }, 5000);
}



module.exports = { buildSocketFunctions,startInterval};
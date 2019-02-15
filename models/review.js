var mongoose = require("mongoose");


var commentSchema = new mongoose.Schema({
    text: String,
    author: String,
    
   
});

var Menu= mongoose.model("review",commentSchema);

var seed = [
    {
        text: " this is place is good", author: " john"
    },{
         text: " this is place is best", author: " Dave"
    }
    
    ]
    
function reviwed() {
    // body...
    seed.forEach(function(each_menu){
      Menu.create(each_menu, function(error, successmenuadd){
          if (error){
              console.log(error);
          }else{
              console.log('reviewd added succssfully');
          }
      }) 
    })

}

//reviwed();

module.exports = Menu;
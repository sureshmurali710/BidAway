(function($) {

    let newDecriptionArea = $("#ratinginputGroupSelect")

$("#new-ratings").submit(function(event){
    
    event.preventDefault();
    
    var requestConfig = {
        method: "POST",
        url: "/ratings",
        contentType: "application/json",
        data: JSON.stringify({
          description: newDecriptionArea.val()
        })
      };
      
    
      $.ajax(requestConfig).then(function(response){
       
          location.reload()
        
      })
})




})(window.jQuery);
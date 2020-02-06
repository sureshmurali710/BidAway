(function($) {

    let newDecriptionArea = $("#new-task-description")

$("#new-item-form").submit(function(event){
    event.preventDefault();
    var newContent = $("#todo-area");
    var requestConfig = {
        method: "POST",
        url: "/comments",
        contentType: "application/json",
        data: JSON.stringify({
          description: newDecriptionArea.val()
        })
      };
      
    
      $.ajax(requestConfig).then(function(response){
        newDecriptionArea.val('').empty()
        let newitem=$(response);
        newContent.append(newitem)
      })
})




})(window.jQuery);

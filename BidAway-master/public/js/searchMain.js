(function() {

//document.getElementsById()

countdown("5de35c3734ef1a55ec94a3af","Sun Dec 01 2019 03:22:47 GMT-0500")

function countdown(id,et){
    var countDownDate = new Date(et).getTime();
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
        document.getElementById("5de35c3734ef1a55ec94a3af").innerHTML = hours + "h "
        + minutes + "m " + seconds + "s ";
    
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("5de35c3734ef1a55ec94a3af").innerHTML = "EXPIRED";
        }
    }, 1000);    
  }
    
  })();
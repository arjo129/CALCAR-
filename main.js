var serialInput = "";
var connectionId;
var dps = []; // dataPoints
var chart;
var openPort = function (path) {
  console.log("Selecting: "+path);
  document.querySelector('#list').style.visibility = "hidden";
  document.querySelector('#scope').style.visibility = "visible";
  chrome.serial.connect(path,{bitrate:115200}, function(coninfo){
    connectionId = coninfo.connectionId;
    //document.querySelector('#graph').style.visibility = "visible";
    chart = new CanvasJS.Chart("graph",{
			title :{
				text: ""
			},			
			data: [{
				type: "line",
				dataPoints: dps 
			}]
		});
  });
}

var replay = function(){
  
}
var onGetDevices = function (ports) {
  for (var i=0; i<ports.length; i++) {
    document.querySelector('#list').innerHTML += "<li id="+ports[i].path+">"+ports[i].path+"</a></li>";
    document.getElementById(ports[i].path).addEventListener("click",function(){
      
      console.log("hello");
      openPort(event.target.id);
      
    });
  }
};
var unfinishedserial  = "", previousfunction=0;
var onReceiveCallback = function (info) {
  if ( info.data) {
    var str = String.fromCharCode.apply(null, new Uint8Array(info.data));
    console.log(str);
    var values = str.split("\n");
    values[0] = unfinishedserial + values[0];
    if(str.charAt(str.length - 1)!="\n"){
      //Carry the value over to next transmission as the Serial message is incomplete
      unfinishedSerial = values[values.length - 1];
      //Remove the value from values
      values.splice(values.length-1,1);
      for(i = 0; i <values.length; i++){
        try{
          x = (+values[i]) + dps[dps.length-1].x;
          dps.push({x: x-1, y: (previousfunction%2==0)?1:0 })
          dps.push({x: x, y: (previousfunction%2==0)?0:1 })
        }catch(error){
          x = +values[i];
          dps.push({x: x, y: (previousfunction%2==0)?0:1 })
        }
        previousfunction++;
      }
    }
    chart.render();
  }
};


window.onload = function() {
  console.log("starting app");
  document.querySelector('#greeting').innerText = "Arduino Oscilloscope";
  document.querySelector('#scope').style.visibility = "hidden";
  document.getElementById("Reset").addEventListener("click", function(){
    dps = [];
    unfinishedserial  = "";
    previousfunction=0;
    chart = new CanvasJS.Chart("graph",{
			title :{
				text: ""
			},			
			data: [{
				type: "line",
				dataPoints: dps 
			}]
		});
  })
  chrome.serial.getDevices(onGetDevices);
  chrome.serial.onReceive.addListener(onReceiveCallback);
};

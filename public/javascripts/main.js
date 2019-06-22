navigator.getUserMedia(
  { video: true, audio: false },
  function(stream) {
    var Peer = window.SimplePeer;
    var peer = new Peer({
      initiator: location.hash === "#init",
      trickle: false,
      stream: stream
    });

    peer.on("signal", function(data) {
      console.log("signal");
      document.getElementById("yourId").value = JSON.stringify(data);
    });

    document.getElementById("connect").addEventListener("click", function() {
      var otherId = JSON.parse(document.getElementById("otherId").value);
      peer.signal(otherId);
    });

    document.getElementById("send").addEventListener("click", function() {
      var yourMessage = document.getElementById("yourMessage").value;
      peer.send(yourMessage);
    });

    peer.on("data", function(data) {
      document.getElementById("messages").textContent += data + "\n";
    });

    peer.on("stream", function(stream) {
      var video = document.getElementById("video");
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream); // for older browsers
      }
      video.play();
    });
  },
  function(err) {
    console.error(err);
  }
);

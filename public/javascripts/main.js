var Peer = window.SimplePeer;
var peer = null;

function addUserMedia(success, error) {
  navigator.getUserMedia({ video: true, audio: false }, success, error);
}

function addPeerListeners() {
  if (!peer) throw "Todavia no se inicio el peer";
  peer.on("signal", function(data) {
    if (data.type === "offer" || data.type === "answer") {
      console.log("signal type", data.type);
      if (!document.getElementById("yourId").value) {
        document.getElementById("yourId").value = JSON.stringify(data);
      }
    } else {
      console.log("signal");
    }
  });

  peer.on("data", function(data) {
    document.getElementById("messages").textContent += data + "\n";
  });

  // Cuando se empareja correctamente con otro peer
  peer.on("connect", function() {
    console.log("CONNECTED");
  });

  peer.on("stream", function(stream) {
    console.log("stream recived");
    var video = document.getElementById("video");
    if ("srcObject" in video) {
      video.srcObject = stream;
    } else {
      video.src = window.URL.createObjectURL(stream); // for older browsers
    }
    video.play();
  });
}

function createPeer(stream) {
  var peerConfig = {
    initiator: location.hash === "#init",
    trickle: false,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "stun:numb.viagenie.ca:3478",
          username: "machester4@gmail.com",
          credential: "micael221"
        },
        {
          urls: "turn:numb.viagenie.ca:3478",
          username: "machester4@gmail.com",
          credential: "micael221"
        }
      ]
    }
  };
  if (stream) {
    peerConfig["stream"] = stream;
  }
  peer = new Peer(peerConfig);
  addPeerListeners();
}

window.addEventListener("load", function() {
  if (location.hash === "#init") {
    addUserMedia(
      function(stream) {
        createPeer(stream);
      },
      function(err) {
        console.error(err);
      }
    );
  } else {
    createPeer(null);
  }
  document.getElementById("connect").addEventListener("click", function() {
    var otherId = JSON.parse(document.getElementById("otherId").value);
    peer.signal(otherId);
  });

  document.getElementById("send").addEventListener("click", function() {
    var yourMessage = document.getElementById("yourMessage").value;
    peer.send(yourMessage);
  });
});

var socket = io();
var Peer = window.SimplePeer;
var peer = null;

socket.on("connect", function() {
  console.log("conectado al servidor");
});

socket.on("disconnect", function() {
  console.log("Perdimos la conexion con el servidor");
});

socket.on("answer-signal", function(answer) {
  console.log("answer-signal");
  peer.signal(answer);
});

function addUserMedia(success, error) {
  navigator.getUserMedia({ video: true, audio: false }, success, error);
}

function addPeerListeners() {
  if (!peer) throw "Todavia no se inicio el peer";
  peer.on("signal", function(data) {
    if (data.type === "offer") {
      socket.emit("assing-offer-code", data, resp => {
        document.getElementById("code").value = resp;
      });
      console.log("signal type", data.type);
    } else if (data.type === "answer") {
      var code = document.getElementById("code").value;
      socket.emit("answer-want-offer-signal", { code, answer: data });
      console.log("signal type", data.type);
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
    var code = document.getElementById("code").value;
    socket.emit("answer-want-connect", code, offer => {
      if (offer) {
        peer.signal(offer);
      }
    });
  });

  document.getElementById("send").addEventListener("click", function() {
    var yourMessage = document.getElementById("yourMessage").value;
    peer.send(yourMessage);
  });
});

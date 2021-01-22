const socket = io("/");
const peer = new Peer();
const peers = {};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userId) => {
  peers[userId] && peers[userId].close();
});

const videos = document.getElementById("videos");
const video = document.createElement("video");
video.muted = true;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(video, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      //   call.on("close", () => {
      //     video.remove();
      //   });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videos.append(video);
}

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

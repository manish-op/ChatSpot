"use strict";

// DOM Elements
const usernamePage = document.querySelector("#username-page");
const chatPage = document.querySelector("#chat-page");
const usernameForm = document.querySelector("#usernameForm");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#message");
const messageArea = document.querySelector("#messageArea");
const connectingElement = document.querySelector(".connecting");

// Global state
let stompClient = null;
let username = null;
let password = null;

// Avatar colors
const colors = [
  "#2196F3", "#32c787", "#00BCD4", "#ff5652", "#ffc107",
  "#ff85af", "#FF9800", "#39bbb0", "#fcba03", "#fc0303",
  "#de5454", "#b9de54", "#54ded7", "#1358d6", "#d611c6"
];

// Handle login and authentication
function connect(event) {
  event.preventDefault();

  username = document.querySelector("#name").value.trim();
  password = document.querySelector("#password").value;

  if (username && password) {
    fetch("/api/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          // Hide login page, show chat
          usernamePage.classList.add("hidden");
          chatPage.classList.remove("hidden");

          // Connect to WebSocket
          const socket = new SockJS("/websocket");
          stompClient = Stomp.over(socket);
          stompClient.connect({}, onConnected, onError);
        } else {
          document.getElementById("mes").innerText = "Invalid username or password";
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
        document.getElementById("mes").innerText = "Server error. Try again.";
      });
  } else {
    document.getElementById("mes").innerText = "Please enter both username and password";
  }
}

// Called when WebSocket connection is established
function onConnected() {
  stompClient.subscribe("/topic/public", onMessageReceived);

  // Notify server of join event
  stompClient.send("/app/chat.register", {}, JSON.stringify({ sender: username, type: "JOIN" }));

  connectingElement.classList.add("hidden");
}

// Handle WebSocket error
function onError(error) {
  connectingElement.textContent = "Could not connect to WebSocket. Please refresh.";
  connectingElement.style.color = "red";
}

// Send message
function send(event) {
  const messageContent = messageInput.value.trim();

  if (messageContent && stompClient) {
    const chatMessage = {
      sender: username,
      content: messageContent,
      type: "CHAT",
    };

    stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    messageInput.value = "";
  }

  event.preventDefault();
}

// Display received message
function onMessageReceived(payload) {
  const message = JSON.parse(payload.body);
  const messageElement = document.createElement("li");

  if (message.type === "JOIN") {
    messageElement.classList.add("event-message");
    message.content = message.sender + " joined!";
  } else if (message.type === "LEAVE") {
    messageElement.classList.add("event-message");
    message.content = message.sender + " left!";
  } else if (message.type === "CHAT") {
    messageElement.classList.add("chat-message");

    const avatarElement = document.createElement("i");
    const avatarText = document.createTextNode(message.sender[0]);
    avatarElement.appendChild(avatarText);
    avatarElement.style["background-color"] = getAvatarColor(message.sender);

    const usernameElement = document.createElement("span");
    usernameElement.textContent = message.sender;
    usernameElement.style["color"] = getAvatarColor(message.sender);

    messageElement.appendChild(avatarElement);
    messageElement.appendChild(usernameElement);
  }

  const textElement = document.createElement("p");
  textElement.textContent = message.content;
  messageElement.appendChild(textElement);

  if (message.sender === username) {
    messageElement.classList.add("own-message");
  }

  messageArea.appendChild(messageElement);
  messageArea.scrollTop = messageArea.scrollHeight;
}

// Choose a color based on username
function getAvatarColor(messageSender) {
  let hash = 0;
  for (let i = 0; i < messageSender.length; i++) {
    hash = 31 * hash + messageSender.charCodeAt(i);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
}

// Event Listeners
usernameForm.addEventListener("submit", connect, true);
messageForm.addEventListener("submit", send, true);

// Confirm before leaving page
window.onbeforeunload = function () {
  return "Are you sure you want to leave?";
};

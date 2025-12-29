const input = document.getElementById("input");
const chat = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const toggleSidebar = document.getElementById("toggleSidebar");
const chatSidebar = document.getElementById("chatSidebar");
const closeSidebar = document.getElementById("closeSidebar");

let currentChat = "general";
const chats = {
  general: [],
  support: [],
  design: []
};

// Toggle sidebar
toggleSidebar.addEventListener("click", () => chatSidebar.classList.add("active"));
closeSidebar.addEventListener("click", () => chatSidebar.classList.remove("active"));

// Switch chat
chatList.querySelectorAll(".chat-item").forEach(item => {
  item.addEventListener("click", () => {
    chatList.querySelectorAll(".chat-item").forEach(i=>i.classList.remove("active"));
    item.classList.add("active");
    currentChat = item.dataset.chat;
    chatTitle.textContent = item.textContent.trim();
    renderMessages();
    chatSidebar.classList.remove("active");
  });
});

// Send message
function sendMessage() {
  const text = input.value.trim();
  if(!text) return;
  addMessage("outgoing", text);
  input.value = "";
  setTimeout(()=>addMessage("incoming", `Echo: ${text}`), 500);
}

// Add message
function addMessage(type,text){
  const bubble = {type,text,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})};
  chats[currentChat].push(bubble);
  renderMessages();
  updateBadge();
}

// Render messages
function renderMessages(){
  chat.innerHTML = "";
  chats[currentChat].forEach(m=>{
    const div = document.createElement("div");
    div.className = `message ${m.type} glass`;
    div.innerHTML = `<div>${m.text}</div><div class="time">${m.time}</div>`;
    chat.appendChild(div);
  });
  chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
}

// Update badges
function updateBadge(){
  chatList.querySelectorAll(".chat-item").forEach(item=>{
    const key = item.dataset.chat;
    const unread = chats[key].filter(m=>m.type==="incoming").length;
    item.querySelector(".badge").textContent = unread;
  });
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => { if(e.key==="Enter") sendMessage(); });

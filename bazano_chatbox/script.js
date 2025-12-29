(function () {
  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else el.setAttribute(k, v);
    });
    children.forEach((c) => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return el;
  }

  function createIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.classList.add("bazano-chat__toggle-icon");
    svg.innerHTML = `
      <path fill="currentColor" d="M12 3C7 3 3 6.6 3 11c0 2.2 1.1 4.2 2.9 5.7-.2 1.5-.8 2.9-1.9 4 2.1-.5 3.7-1.3 4.7-2.1 1.1.3 2.1.4 3.3.4 5 0 9-3.6 9-8s-4-8-9-8z"/>
    `;
    return svg;
  }

  function mount(container, options = {}) {
    const title = options.title || "Bazano Support Chat";
    const position = options.position === "bottom-left" ? "bottom-left" : "bottom-right";
    const theme = options.theme === "dark" ? "dark" : "light";
    const placeholder = options.placeholder || "Type a message...";
    const welcome = options.welcome || "Hi! How can I help?";

    const root = h("div", { class: `bazano-chat bazano-chat--${position}` });

    const toggleBtn = h("button", { class: "bazano-chat__toggle", "aria-label": "Open chat" }, [createIcon()]);
    const panel = h("div", { class: "bazano-chat__panel" });

    const header = h("div", { class: "bazano-chat__header" }, [
      h("div", { class: "bazano-chat__title", text: title }),
      h("button", { class: "bazano-chat__close", "aria-label": "Close" }, [document.createTextNode("×")]),
    ]);

    const messages = h("div", { class: "bazano-chat__messages" });
    const inputRow = h("div", { class: "bazano-chat__input-row" });
    const input = h("input", { class: "bazano-chat__input", type: "text", placeholder });
    const sendBtn = h("button", { class: "bazano-chat__send" }, [document.createTextNode("ارسال")]);

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    panel.appendChild(header);
    panel.appendChild(messages);
    panel.appendChild(inputRow);

    root.appendChild(toggleBtn);
    root.appendChild(panel);

    // Theme
    if (theme === "dark") root.classList.add("bazano-chat--dark");

    // Welcome message
    appendMessage(messages, welcome, "bot");

    // Interactions
    toggleBtn.addEventListener("click", () => {
      root.classList.toggle("bazano-chat--open");
      const open = root.classList.contains("bazano-chat--open");
      toggleBtn.setAttribute("aria-expanded", String(open));
    });

    header.querySelector(".bazano-chat__close").addEventListener("click", () => {
      root.classList.remove("bazano-chat--open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });

    sendBtn.addEventListener("click", () => send());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send();
    });

    function send() {
      const text = input.value.trim();
      if (!text) return;
      appendMessage(messages, text, "user");
      input.value = "";

      // Demo bot reply (replace with backend integration if needed)
      setTimeout(() => {
        appendMessage(messages, "پیام شما دریافت شد. تیم پشتیبانی به زودی پاسخ می‌دهد.", "bot");
      }, 600);
    }

    // Mount
    container.innerHTML = "";
    container.appendChild(root);
  }

  function appendMessage(listEl, text, role = "bot") {
    const msgClass = role === "user" ? "bazano-chat__msg bazano-chat__msg--user" : "bazano-chat__msg bazano-chat__msg--bot";
    const msg = h("div", { class: msgClass }, [text]);
    listEl.appendChild(msg);
    listEl.scrollTop = listEl.scrollHeight;
  }

  // Expose
  window.BazanoChatbox = { mount };
})();
(function () {
  "use strict";

  // Chatbot Configuration
  const CHATBOT_CONFIG = {
    apiEndpoint: "/api/chatbot/chat", // Backend route
    ownerName: "Ayub Khan",
    welcomeMessage:
      "Hi! I’m Ayub Khan, a Junior App Developer. Ask me anything about my skills, projects, experience, or education! 🚀",
    primaryColor: "#2c3e50",
    quickActions: [
      { label: "Skills", message: "Show me your skills" },
      { label: "Projects", message: "Tell me about your projects" },
      { label: "Experience", message: "Share your experience" },
      { label: "Education", message: "Tell me about your education" },
      { label: "Contact", message: "How can I contact you?" },
    ],
  };

  if (window.PortfolioChatbot) return; // prevent multiple loads

  // ✅ Inject CSS Styles
  function injectStyles() {
    if (document.getElementById("portfolio-chatbot-styles")) return;

    const style = document.createElement("style");
    style.id = "portfolio-chatbot-styles";

    style.textContent = `
      #portfolio-chatbot-widget { position: fixed; right: 20px; bottom: 80px; z-index: 999999; font-family: 'Poppins', sans-serif; }
      .portfolio-chat-icon { width: 60px; height: 60px; background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #34495e); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.3s ease; animation: portfolio-pulse 2s infinite; }
      .portfolio-chat-icon:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(0,0,0,0.4); }
      @keyframes portfolio-pulse { 0% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); } 50% { box-shadow: 0 4px 20px rgba(44,62,80,0.6); } 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.3); } }

      .portfolio-chat-widget { width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); display: none; flex-direction: column; overflow: hidden; position: absolute; bottom: 70px; right: 0; }
      .portfolio-chat-widget.open { display: flex; animation: portfolio-slideUp 0.3s ease-out; }
      @keyframes portfolio-slideUp { from { opacity: 0; transform: translateY(20px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

      .portfolio-chat-header { background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #34495e); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
      .portfolio-chat-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
      .portfolio-online-status { font-size: 12px; color: #2ecc71; margin-top: 2px; display: block; }

      .portfolio-close-btn { background: none; border: none; color: white; cursor: pointer; font-size: 18px; }

      .portfolio-chat-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8f9fa; word-wrap: break-word; }

      .portfolio-message { margin-bottom: 12px; display: flex; align-items: flex-start; }
      .portfolio-message.user { justify-content: flex-end; }

      .portfolio-message-content { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.4; }

      /* ✅ User bubble */
      .portfolio-message.user .portfolio-message-content {
        background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #34495e);
        color: white;
        border-radius: 16px 16px 4px 16px;
      }

      /* ✅ AI bubble (text color FIXED) */
      .portfolio-message.ai .portfolio-message-content {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 16px 16px 16px 4px;
        color: #111; /* FIXED ✅ AI TEXT IS NOW VISIBLE */
      }

      .portfolio-typing-indicator { padding: 12px; display: none; }
      .portfolio-typing-indicator.show { display: block; }

      .portfolio-quick-actions { padding: 12px; background: #f8f9fa; display: flex; gap: 8px; flex-wrap: wrap; }
      .portfolio-quick-btn { background: white; border: 1px solid #e1e5e9; padding: 6px 12px; border-radius: 12px; cursor: pointer; font-size: 12px; }
      .portfolio-quick-btn:hover { background: ${CHATBOT_CONFIG.primaryColor}; color: white; }

      .portfolio-chat-input-container { padding: 16px; border-top: 1px solid #e1e5e9; background: white; }
      .portfolio-chat-input-form { display: flex; gap: 8px; align-items: center; }
      .portfolio-message-input { flex: 1; padding: 10px 12px; border: 1px solid #e1e5e9; border-radius: 20px; }
      .portfolio-send-button { background: linear-gradient(135deg, ${CHATBOT_CONFIG.primaryColor}, #34495e); padding: 10px 12px; border-radius: 20px; color: white; border: none; cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  function createChatUI() {
    return `
      <div class="portfolio-chat-icon" id="portfolioChatIcon">💬</div>

      <div class="portfolio-chat-widget" id="portfolioChatWidget">
        <div class="portfolio-chat-header">
          <div>
            <h3>${CHATBOT_CONFIG.ownerName}</h3>
            <span class="portfolio-online-status">● Online</span>
          </div>
          <button class="portfolio-close-btn" id="portfolioCloseBtn">✖</button>
        </div>

        <div class="portfolio-chat-messages" id="portfolioChatMessages">
          <div class="portfolio-message ai">
            <div class="portfolio-message-content">${CHATBOT_CONFIG.welcomeMessage}</div>
          </div>
        </div>

        <div class="portfolio-quick-actions">
          ${CHATBOT_CONFIG.quickActions
            .map(
              (btn) =>
                `<button class="portfolio-quick-btn" onclick="PortfolioChatbot.sendQuickMessage('${btn.message}')">${btn.label}</button>`
            )
            .join("")}
        </div>

        <div class="portfolio-chat-input-container">
          <form class="portfolio-chat-input-form" id="portfolioChatForm">
            <input type="text" id="portfolioMessageInput" class="portfolio-message-input" placeholder="Type message...">
            <button class="portfolio-send-button" id="portfolioSendButton">Send</button>
          </form>
        </div>
      </div>
    `;
  }

  class PortfolioChatbot {
    constructor() {
      this.sessionId = "session_" + Date.now();
      this.init();
    }

    init() {
      injectStyles();
      this.createWidget();
      this.bindEvents();
    }

    createWidget() {
      const container = document.createElement("div");
      container.id = "portfolio-chatbot-widget";
      container.innerHTML = createChatUI();
      document.body.appendChild(container);

      this.chatWidget = document.getElementById("portfolioChatWidget");
      this.chatIcon = document.getElementById("portfolioChatIcon");
      this.closeBtn = document.getElementById("portfolioCloseBtn");
      this.chatForm = document.getElementById("portfolioChatForm");
      this.messagesContainer = document.getElementById("portfolioChatMessages");
      this.messageInput = document.getElementById("portfolioMessageInput");
      this.sendButton = document.getElementById("portfolioSendButton");
    }

    bindEvents() {
      this.chatIcon.addEventListener("click", () => {
        this.chatWidget.classList.add("open");
        this.chatIcon.style.display = "none";
      });

      this.closeBtn.addEventListener("click", () => {
        this.chatWidget.classList.remove("open");
        this.chatIcon.style.display = "flex";
      });

      this.chatForm.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
      e.preventDefault();
      const message = this.messageInput.value.trim();
      if (!message) return;

      this.addMessage(message, "user");
      this.messageInput.value = "";

      try {
        const res = await fetch(CHATBOT_CONFIG.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: this.sessionId, message }),
        });

        const data = await res.json();
        this.addMessage(data.response, "ai");
      } catch (err) {
        this.addMessage("⚠ Error connecting to chatbot server.", "ai");
      }
    }

    addMessage(text, type) {
      const msg = document.createElement("div");
      msg.className = `portfolio-message ${type}`;

      const msgContent = document.createElement("div");
      msgContent.className = "portfolio-message-content";

      /** ✅ FIX — SUPPORT TEXT FORMATTING + NEWLINES */
      msgContent.innerHTML = text.replace(/\n/g, "<br>");

      msg.appendChild(msgContent);
      this.messagesContainer.appendChild(msg);

      setTimeout(
        () => (this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight),
        50
      );
    }

    static sendQuickMessage(message) {
      window.portfolioChatbotInstance.messageInput.value = message;
      window.portfolioChatbotInstance.chatForm.dispatchEvent(new Event("submit"));
    }
  }

  function initializeChatbot() {
    if (window.portfolioChatbotInstance) return;
    window.portfolioChatbotInstance = new PortfolioChatbot();
    window.PortfolioChatbot = PortfolioChatbot;
    console.log("✅ Portfolio Chatbot Loaded");
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initializeChatbot);
  else initializeChatbot();
})();

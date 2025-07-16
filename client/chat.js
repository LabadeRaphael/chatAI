document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const newChatBtn = document.getElementById('newChatBtn');
  const chatHistoryBtn = document.getElementById('chatHistoryBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const searchBtn = document.getElementById('searchBtn');
  const modal = document.getElementById('logoutModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');
  const chatForm = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const mainContent = document.querySelector('.main-content');

  // Sidebar Toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
    mainContent.classList.toggle('closed');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    }
  });

  // Close Sidebar on Body Click
  document.body.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
      sidebar.classList.add('closed');
      mainContent.classList.add('closed');
    }
  });

  // Close Sidebar on Item Press (Small Screens)
  [newChatBtn, chatHistoryBtn, logoutBtn, searchBtn].forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        mainContent.classList.add('closed');
      }
    });
  });

  // New Chat
  newChatBtn.addEventListener('click', () => {
    chatBox.innerHTML = '';
  });

  // Chat History (Placeholder)
  chatHistoryBtn.addEventListener('click', () => {
    alert('Chat History feature coming soon!');
  });

  // Logout function
  if (logoutBtn && modal) {
    logoutBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
    confirmLogout.addEventListener('click', async () => {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = 'login.html';
    });
    cancelLogout.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // Send message to chatbot
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;

      appendMessage('user', message);
      userInput.value = '';

      try {
        const res = await fetch('http://localhost:4000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content: message })
        });

        const data = await res.json();
        if (data?.reply) {
          appendMessage('bot', data.reply);
        }
      } catch (err) {
        appendMessage('bot', 'Error connecting to server.');
      }
    });
  }

  function appendMessage(type, message) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
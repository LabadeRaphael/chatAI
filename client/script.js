// client/script.js
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const logoutBtn = document.getElementById('logoutBtn');
  const modal = document.getElementById('logoutModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const cancelLogout = document.getElementById('cancelLogout');

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
    // Optional: close modal when clicking outside
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

      appendMessage('You', message);
      userInput.value = '';

      try {
        const res = await fetch('http://localhost:4000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ content: message })
        });

        const data = await res.json();
        console.log(data);

        if (data?.reply) {
          appendMessage('Bot', data?.reply);
        }
      } catch (err) {
        appendMessage('Bot', 'Error connecting to server.');
      }
    });
  }

  function appendMessage(sender, message) {
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  // Logout modal logic

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

    // Optional: close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

});

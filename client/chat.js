const URL = 'http://localhost:4000'
async function getUserDetails() {
  try {
    const res = await fetch(`${URL}/api/auth/dashboard`, {
      method: 'GET',
      credentials: 'include', // important to send cookies
    });
    console.log(res);
    if (res.ok) {
      const user = await res.json();
      console.log("User:", user);
      return user;
    } else {
      console.log("Not authenticated");
      window.location.href = 'login.html?message=session_expired';
      return null;
    }
  } catch (err) {
    window.location.href = 'login.html?message=server_error';
    console.log(err.message);

  }
}
document.addEventListener('DOMContentLoaded', async () => {
  const userLogo = document.getElementById('userLogo');
  let userDetails = await getUserDetails()
  const renderedChatIds = new Set();
  const userName = userDetails.name; // e.g., "labade"
  const initials = userName.slice(0, 2).toUpperCase(); // "la" → "LA"
  userLogo.innerText = initials;
  console.log(userDetails.name);
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const newChatBtn = document.getElementById('newChatBtn');
  const chatHistoryBtn = document.getElementById('chatHistoryBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  // const DelBtn = document.getElementById('logoutBtn');
  const spinner = document.getElementById('spinner');
  const searchContainer = document.getElementById('searchContainer');
  const searchInput = document.getElementById('search');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  const modal = document.getElementById('logoutModal');
  const delModal = document.getElementById('delModal');
  const delHisModal = document.getElementById('delHisModal');
  const confirmLogout = document.getElementById('confirmLogout');
  const confirmHisDel = document.getElementById('confirmHisDel');
  const cancelDel = document.getElementById('cancelDel');
  const cancelHisDel = document.getElementById('cancelHisDel');
  const confirmDel = document.getElementById('confirmDel');
  const chatForm = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  let delMsg = document.getElementById('delMsg');
  const chatHistory = document.getElementById('chat-history');
  const mainContent = document.querySelector('.main-content');
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const messageBox = document.getElementById('messageBox')
  const delHis = document.getElementById("deleteBtn")
  const newMsg = document.createElement('div');
  const newMsgCon = document.createElement('div');
  newMsg.classList.add('newChat');
  newMsgCon.classList.add('newChatCon');
  const message = `Hey ${userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}.What is on your agenda today?`
  newMsg.innerHTML = message;
  newMsgCon.appendChild(newMsg)
  chatBox.appendChild(newMsgCon);
  let isSidebarOpen = true;
  let newChat = true;

  // Tooltip control
  sidebarItems.forEach(item => {
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.innerText = item.textContent.trim();
    item.appendChild(tooltip);

    item.addEventListener('mouseenter', () => {
      if (sidebar.classList.contains('closed')) {
        tooltip.style.display = 'block';
      }
    });

    item.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });

  function updateSidebarState() {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open', 'closed');
      mainContent.classList.remove('closed');
      isSidebarOpen = true;
    } else if (!sidebar.classList.contains('open')) {
      sidebar.classList.add('closed');
      mainContent.classList.add('closed');
      isSidebarOpen = false;
    }
  }
  updateSidebarState();
  window.addEventListener('resize', updateSidebarState);

  sidebarToggle.addEventListener('click', () => {
    const shouldClose = !sidebar.classList.contains('closed');
    sidebar.classList.toggle('closed');
    mainContent.classList.toggle('closed');
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
      isSidebarOpen = sidebar.classList.contains('open');
    } else {
      isSidebarOpen = !shouldClose;
      chatHistory.style.display = "none"
       searchContainer.style.display="none"
    }

    if (isSidebarOpen) {

      // Hide all tooltips if sidebar is open
      document.querySelectorAll('.tooltip').forEach(t => t.style.display = 'none');

      // Hide all chathistory if sidebar is open
      chatHistory.style.display = "flex"
      searchContainer.style.display="flex"
    }
  });

  document.body.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove('open');
      sidebar.classList.add('closed');
      mainContent.classList.add('closed');
      isSidebarOpen = false;
    }
  });

  [newChatBtn, chatHistoryBtn, logoutBtn, searchBtn].forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        mainContent.classList.add('closed');
        isSidebarOpen = false;
      }
    });
  });

  newChatBtn.addEventListener('click', () => {
    newChat = true;
    chatBox.innerHTML = ""
    // remove delete btn if present
    delHis.style.display = "none";
    const newMsg = document.createElement('div');
    const newMsgCon = document.createElement('div');
    newMsg.classList.add('newChat');
    newMsgCon.classList.add('newChatCon');
    const message = `Hello ${userName.charAt(0).toUpperCase() + userName.slice(1).toLowerCase()}! How can i assist u today?`
    newMsg.innerHTML = message;
    newMsgCon.appendChild(newMsg)
    chatBox.appendChild(newMsgCon);
  });


  searchBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    messageBox.innerHTML = ""
     // remove delete btn if present
    delHis.style.display = "none";
    messageBox.removeAttribute("class");
    let searchTerm = searchInput.value.trim()
    console.log("searchTerm", searchTerm);
    searchResults.innerHTML = ""
    if (!searchTerm)  {searchInput.focus()}
    else{
      try {
        searchBtn.classList.add("disabled");
        const res = await fetch(`${URL}/api/auth/search?q=${encodeURIComponent(searchTerm)}`, {
          method: 'GET',
          credentials: 'include', // important to send cookies
        });
        const result = await res.json()
        const searchData = result.searchData
  
        if (res.ok) {
          chatBox.innerHTML = ""
          const successMsg = result?.message
          messageBox.className = "message success"
          messageBox.innerText = successMsg
          searchData.forEach(msg => {
            const box = document.createElement("div");
            box.classList.add("message-box");
            box.innerHTML = `
              <div class="message-user">
              ${msg.sender || 'You'}
              </div>
              <div class="message-content">${msg.content}</div>
            `;
            searchResults.appendChild(box);
            // chatBox.appendChild(box);
          });
        }
        if (!res.ok) {
          console.log(res);
          console.log("Something went wrong");
          console.log(result?.message);
          console.log(result);
  
  
          const errorMsg = result?.message
          console.log(errorMsg);
  
          messageBox.className = "message error" || 'Something went wrong retry'
          messageBox.innerText = errorMsg
          console.log(res.status);
          if (res.status === 401) {
            console.log(res.status);
            setTimeout(() => {
              window.location.href = "login.html"
            }, 3000);
          }
          // throw new Error(result.message || 'Something went wrong');
        }
  
      } catch (err) {
        const errorMsg = err.response.data.message || 'Something went wrong retry'
        messageBox.className = "message error"
        messageBox.innerText = errorMsg
  
      } finally {
         searchBtn.classList.remove("disabled");
      }
      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.removeAttribute("class")
      }, 3000);
    }
  });

  //  delHis.style.display = "none";

  chatHistoryBtn.addEventListener('click', async () => {
    chatBox.innerHTML = ""

    try {
      const res = await fetch(`${URL}/api/chat/history`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      console.log(data);

      if (data?.history) {
        delHis.style.display = "flex";
        chatMessages = data.history;
        chatMessages.forEach(item => appendMessage(item.sender, item.content));
      }
      else if (data?.history.length === 0) {
        const errorMsg = "No chat history yet start  chat"
        messageBox.className = "message error"
        messageBox.innerText = errorMsg
      }
      else {
        throw new Error(data?.error || 'Something went wrong');
      }
    } catch (err) {
      console.log("Error fetching chat history from DB", err);
      const errorMsg = err.message || 'Something went wrong retry'
      messageBox.className = "message error"
      messageBox.innerText = errorMsg
    }
    setTimeout(() => {
      messageBox.textContent = "";
      messageBox.removeAttribute("class")
    }, 3000);
  });

  delHis.addEventListener("click", async () => {
    delHisModal.style.display = 'flex';

  })
  confirmHisDel.addEventListener("click", async () => {
    try {
      const res = await fetch(`${URL}/api/chat/history/delete`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      console.log(data);
      if (data.message.length === 0 && data.chatSession.length === 0) {
        chatBox.innerHTML = ""
        chatHistory.innerHTML = ""
        localStorage.removeItem("chatTitles")
        delHis.style.display = "none";
        delHisModal.style.display = 'none';
        const successMsg = "Chat history deleted successfully"
        messageBox.className = "message success"
        messageBox.innerText = successMsg
      }
      else {
        throw new Error(data?.error || 'Something went wrong');
      }
    } catch (err) {
      console.log("Error fetching chat history from DB", err);
      const errorMsg = err.message || 'Something went wrong retry'
      messageBox.className = "message error"
      messageBox.innerText = errorMsg
    }
    setTimeout(() => {
      messageBox.textContent = "";
      messageBox.removeAttribute("class")
    }, 3000);
  })
  cancelHisDel.addEventListener("click", () => {
    delHisModal.style.display = 'none';
  })
  window.addEventListener('click', (e) => {
    if (e.target === delHisModal) delHisModal.style.display = 'none';
  });

  if (logoutBtn && modal) {
    logoutBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
    confirmLogout.addEventListener('click', async () => {
      await fetch(`${URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = 'login.html';
      localStorage.clear()
    });
    cancelLogout.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
  if (chatForm) {
    let chatMessages = [];
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;
      appendMessage('user', message);

      // Finally add to chat history container
      console.log(newChat);
      let isNewChat = newChat === true
      console.log("is new chat", isNewChat);
      userInput.value = '';

      try {
        chatForm.classList.add("disabled");
        const res = await fetch(`${URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content: message, title: message, newStatus: isNewChat })
        });

        const data = await res.json();
        if (data?.reply) {
          appendMessage('bot', data.reply);
          if (isNewChat) {
            newChat = false; // Reset newChat flag
            let see = await fetchChatTitle(); // Fetch updated titles from server
            console.log(see);
          }

        }
      } catch (err) {
        appendMessage('bot', 'Error connecting to server.');
        console.log("Error in chat submission");
      } finally {
        chatForm.classList.remove("disabled");
      }
    });
  }
  async function renderChatTitle(message, id) {
    const rawTitles = localStorage.getItem("chatTitles");
    let currentTitles = rawTitles ? JSON.parse(rawTitles) : [];
    if (renderedChatIds.has(id)) {
      console.log(`Chat title already rendered for id: ${id}`);
      return;
    }

    renderedChatIds.add(id); // Mark this chat ID as rendered

    if (message.length > 12) {
      message = message.slice(0, 12) + "..."
      console.log(message);
    }
    currentTitles.push({ message, _id: id });
    localStorage.setItem("chatTitles", JSON.stringify(currentTitles));
    console.log("create chatTitle in render");

    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = message;

    const dotSpan = document.createElement('span');
    dotSpan.classList.add('message-options');
    dotSpan.innerHTML = '...';

    const messageItem = document.createElement('div');
    messageItem.classList.add('message-item');
    messageItem.appendChild(msgDiv);
    messageItem.appendChild(dotSpan);
    chatHistory.appendChild(messageItem);

    msgDiv.addEventListener('click', async () => {
      chatBox.innerHTML = ""
      try {
        const res = await fetch(`${URL}/api/chat/history/${id}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        if (data?.chatSession) {
          chatSession = data.chatSession.messages;
          console.log("chatSession", chatSession);
          chatSession?.forEach((item) => {
            console.log(item);
            appendMessage(item.sender, item.content)
          });
        }
      } catch (err) {
        console.log("Error fetching chat history for ID", err);
      }
    })

    // Tooltip container
    const tooltip = document.createElement('div');
    tooltip.classList.add('delete-tooltip');
    tooltip.innerHTML = "Delete";
    messageItem.appendChild(tooltip);

    dotSpan.addEventListener("click", () => {
      tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      console.log("message", message);
    })

    tooltip.addEventListener('click', () => {
      tooltip.style.display = 'none';
      delMsg.textContent = message
      delModal.style.display = 'flex';
      console.log("message", message);

      confirmDel.addEventListener('click', async () => {
        try {
          let res = await fetch(`${URL}/api/chat/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          const data = await res.json();
          if (res.ok) {
            // await fetchChatTitle();
            const updatedTitles = currentTitles.filter(item => item._id !== id);
            localStorage.setItem("chatTitles", JSON.stringify(updatedTitles));
            console.log('Deleted successfully');
            delModal.style.display = 'none';
            // remove the message from sidebar
            messageItem.remove()
          } else {
            console.error('Delete failed:', data?.error || res.statusText);
            delModal.style.display = 'none';
          }
        } catch (err) {
          delModal.style.display = 'none';
          console.log("Network error:", err.message);
        }

      });
      cancelDel.addEventListener('click', () => {
        delModal.style.display = 'none';
      });
      window.addEventListener('click', (e) => {
        if (e.target === delModal) delModal.style.display = 'none';
      });
    });
  }

  function appendMessage(type, message) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function fetchHistory() {
    const localData = localStorage.getItem("chatHistory");

    if (localData) {
      chatMessages = JSON.parse(localData);
      chatMessages.forEach(item => appendMessage(item.sender, item.message));
    } else {
      // fallback to DB
      try {
        const res = await fetch(`${URL}/api/chat/history`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await res.json();
        console.log(data);

        if (data?.history) {
          chatMessages = data.history;
          localStorage.setItem("chatHistory", JSON.stringify(chatMessages));
          chatMessages.forEach(item => appendMessage(item.sender, item.content));
          // chatHistory.appendChild(item.sender);
        }
      } catch (err) {
        console.log("Error fetching chat history from DB", err);
      }
    }
  }

  async function fetchChatTitle() {
    let rawTitle = localStorage.getItem("chatTitles")
    localTitle = JSON.parse(rawTitle);
    if (localTitle) {
      localTitle.forEach((message) => {
        if (message.title && message._id) {
          console.log(message.title && message._id);
          renderChatTitle(message.title, message._id);
        } else {
          console.log("Skipping invalid local title:", message);
        }
      })
    }

    try {
      const res = await fetch(`${URL}/api/chat/title`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await res.json();
      if (data?.titles) {
        // Update localStorage with server titles
        localStorage.setItem("chatTitles", JSON.stringify(data.titles));
        data.titles.forEach((message) => {
          if (message.title && message._id) {
            console.log(message.title && message._id);
            console.log(message.title.length);
            renderChatTitle(message.title, message._id);
          } else {
            console.log("Skipping invalid server title:", message);
          }
        });
      }
      return "hit fetch";
    } catch (err) {
      console.log("Error fetching chat titles from DB:", err);
    }
  }
  await fetchChatTitle();
});


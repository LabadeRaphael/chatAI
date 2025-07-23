// client/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const params = new URLSearchParams(window.location.search);
  const msg = params.get('message');
  if (msg === 'session_expired') {
    const errorMsg = "Your session has expired. Please log in again."
    messageBox.className="message error"
    messageBox.innerText= errorMsg 
  }
  else if (msg === 'server_error') {
    const errorMsg = "Internal server error has. Please log in again."
          messageBox.className="message error"
          messageBox.innerText= errorMsg 
  }
  // Login logic
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // clear error message before registering again if errror is ecounter 
        messageBox.innerHTML=""
        messageBox.removeAttribute("class");
        const res = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          const successMsg = data?.message
          messageBox.className="message success"
          messageBox.innerText=successMsg
          setTimeout(() => {
            window.location.href = 'chat.html';
            localStorage.clear()
          },1500 );
        } else {
         const errorMsg = data?.message || 'Login failed retry'
          messageBox.className="message error"
          messageBox.innerText= errorMsg 
        }
      } catch (err) {
         const errorMsg = err.response.data.message || 'Error logging in retry'
          messageBox.className="message error"
          messageBox.innerText= errorMsg 
      }
      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.removeAttribute("class")
      
}, 3000);
    });
  }

  // Register logic
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const messageBox = document.getElementById('messageBox')
      try {
        // clear error message before registering again if errror is ecounter 
        messageBox.innerHTML=""
        messageBox.removeAttribute("class");
        const res = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ name, email, password })
        });

        const data = await res?.json();
        console.log(data);
        
        if (res.ok) {
          const successMsg = data?.message
          messageBox.className="message success"
          messageBox.innerText=successMsg
          setTimeout(() => {
            window.location.href = 'login.html';
          },1500 );
        } else {
          const errorMsg = data?.message
          messageBox.className="message error"
          messageBox.innerText= errorMsg 
          // alert(data.message || 'Registration failed');
        }
      } catch (err) {
         const errorMsg = err.response.data.message
          messageBox.className="message error"
          messageBox.innerText= errorMsg 
      }
      setTimeout(() => {
        messageBox.textContent = "";
        messageBox.removeAttribute("class")
      
}, 3000);
    });
  }
});

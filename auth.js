document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/auth/session');
        const data = await response.json();

        if (data.loggedIn) {
            const usernameDisplay = document.getElementById('username-display');
            const usernameText = document.getElementById('username-text');
            const loginButton = document.querySelector('.login-button');
            const userMenu = document.getElementById('user-menu');
            const logoutBtn = document.getElementById('logout-btn');

            usernameText.textContent = data.username;
            usernameDisplay.style.display = 'block';
            loginButton.style.display = 'none';

            
            usernameDisplay.addEventListener('click', (event) => {
                event.stopPropagation(); 
                userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
            });

            
            logoutBtn.addEventListener('click', async () => {
                await fetch('/auth/logout', {
                    method: 'POST'
                });

                
                userMenu.style.display = 'none';
                usernameDisplay.style.display = 'none';
                loginButton.style.display = 'block';
            });

            
            document.addEventListener('click', (event) => {
                if (userMenu.style.display === 'block' && !usernameDisplay.contains(event.target)) {
                    userMenu.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error('Eroare la verificarea sesiunii:', error);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const loginPopup = document.getElementById('login-popup');
    const registerPopup = document.getElementById('register-popup');
    const openLoginBtn = document.querySelector('.login-button');
    const openRegisterLink = document.getElementById('open-register');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const register_error = document.getElementById('register-error-message');
    const login_error = document.getElementById('login-error-message');


    const closeBtns = document.querySelectorAll('.close-btn'); 

    closeBtns.forEach(button => {
        button.addEventListener('click', function () {
            if (button.closest('.popup') === loginPopup) {
                closeLoginPopup();
            } else if (button.closest('.popup') === registerPopup) {
                closeRegisterPopup();
            }
        });
    });


function openLoginPopup() {
    loginPopup.style.display = 'block';
    document.body.classList.add('popup-open'); 
    setTimeout(() => {
        loginPopup.classList.add('show');
    }, 10);
}


function openRegisterPopup() {
    loginPopup.classList.remove('show');
    loginPopup.style.display = 'none'; 
    registerPopup.style.display = 'block'; 
    registerPopup.classList.add('show'); 
}


function closePopup(popup) {
    popup.classList.remove('show');
    setTimeout(() => {
        popup.style.display = 'none';
    }, 300);
}

window.addEventListener('click', (event) => {
    if (event.target === loginPopup || event.target === registerPopup) {
        loginPopup.classList.remove('show');
        registerPopup.classList.remove('show');
        login_error.style.display = 'none'; 
        loginForm.reset();
        register_error.style.display = 'none'; 
        registerForm.reset();
        setTimeout(() => {
            loginPopup.style.display = 'none';
            registerPopup.style.display = 'none';
        }, 300);
    }
});


openLoginBtn.addEventListener('click', openLoginPopup);
openRegisterLink.addEventListener('click', openRegisterPopup);
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closePopup(btn.parentElement.parentElement); 
    });
});
    
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        register_error.style.display = 'none';
        const username = document.getElementById('username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert(data.message); 
                registerForm.reset(); 
                window.location.reload();
                closeRegisterPopup(); 
            } else {
                
                register_error.textContent = data.message;
                register_error.style.display = 'block';
            }
        } catch (error) {
            console.error('Eroare la înregistrare:', error);
            register_error.textContent = 'A apărut o eroare la înregistrare. Încearcă din nou.';
            register_error.style.display = 'block';
        }
    });

    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        
        if (usernameInput && passwordInput) {
            const username = usernameInput.value;
            const password = passwordInput.value;
    
            
            login_error.style.display = 'none';
            login_error.textContent = '';
    
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
    
                if (!response.ok) {
                    const errorData = await response.json(); 
                    throw new Error(errorData.message); 
                }
    
                
                loginPopup.style.display = 'none';
                window.location.reload();
                
    
            } catch (error) {
                
                login_error.textContent = error.message; 
                login_error.style.display = 'block'; 
            }
        } else {
            console.error("Input elements not found");
        }
    });

    function closeLoginPopup() {
        loginPopup.classList.remove('show');
        login_error.style.display = 'none'; 
        loginForm.reset(); 
        login_error.textContent = '';
        setTimeout(() => {
            loginPopup.style.display = 'none';
        }, 300);
    }

    function closeRegisterPopup() {
        const registerPopup = document.getElementById('register-popup');
        registerPopup.classList.remove('show');
        register_error.style.display = 'none'; 
        registerForm.reset(); 
        register_error.textContent = '';
        setTimeout(() => {
            registerPopup.style.display = 'none';
        }, 300);
    }


    

    
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.add('show');
    document.body.classList.add('popup-open'); 
}




    const accountInfoPopup = document.getElementById('account-info-popup');
    const accountSettingsButton = document.getElementById('account-settings');
    const closeAccountInfoButton = document.getElementById('close-account-info');

    
    function showAccountInfoPopup() {
        
        fetch('/auth/account-info')
            .then(response => response.json())
            .then(data => {
                
                document.getElementById('account-username').textContent = data.username;
                document.getElementById('account-email').textContent = data.email;
                document.getElementById('account-createdAt').textContent = `${new Date(data.createdAt).toLocaleDateString()}`;
                
                
                accountInfoPopup.style.display = 'block';
                setTimeout(() => {
                    accountInfoPopup.classList.add('show');
                }, 10);
                document.addEventListener('click', closePopupOnClickOutside);
            })
            .catch(error => {
                console.error('Error fetching account info:', error);
            });
    }
    


    
    function closeAccountInfoPopup() {
        accountInfoPopup.classList.remove('show');
        setTimeout(() => {
            accountInfoPopup.style.display = 'none';
        }, 300);
        
        
        document.removeEventListener('click', closePopupOnClickOutside);
    }
    
    
    function closePopupOnClickOutside(event) {
        const popupContent = document.querySelector('.popup-content'); 
    
        
        if (!popupContent.contains(event.target)) {
            closeAccountInfoPopup(); 
        }
    }
    


    
    if (accountSettingsButton) {
        accountSettingsButton.addEventListener('click', showAccountInfoPopup);
    }

    
    if (closeAccountInfoButton) {
        closeAccountInfoButton.addEventListener('click', closeAccountInfoPopup);
    }



const deleteAccountButton = document.getElementById('delete-account'); 
const deleteConfirmationPopup = document.getElementById('delete-confirmation-popup');
const closeDeletePopupButton = document.getElementById('close-delete-popup');
const confirmDeleteButton = document.getElementById('confirm-delete-btn');
const cancelDeleteButton = document.getElementById('cancel-delete-btn');


function showDeleteConfirmationPopup() {
    deleteConfirmationPopup.style.display = 'block';
    setTimeout(() => {
        deleteConfirmationPopup.classList.add('show');
    }, 10);
}

window.addEventListener('click', (event) => {
    if (event.target === deleteConfirmationPopup) {
        closeDeleteConfirmationPopup();
    }
});


function closeDeleteConfirmationPopup() {
    deleteConfirmationPopup.classList.remove('show');
    setTimeout(() => {
        deleteConfirmationPopup.style.display = 'none';
    }, 300);
}

deleteAccountButton.addEventListener('click', showDeleteConfirmationPopup);


cancelDeleteButton.addEventListener('click', closeDeleteConfirmationPopup);
closeDeletePopupButton.addEventListener('click', closeDeleteConfirmationPopup);

const notificationElement = document.getElementById('notification');


function showNotification(message) {
    notificationElement.textContent = message;
    notificationElement.classList.add('show');

    
    setTimeout(() => {
        notificationElement.classList.remove('show');
    }, 3000);
}


confirmDeleteButton.addEventListener('click', () => {
    
    fetch('/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include' 
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            
            showNotification('Contul a fost sters cu succes.');

            
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } else {
            showNotification('A apărut o eroare la stergerea contului.');
        }
    })
    .catch(error => {
        console.error('Eroare la ștergerea contului:', error);
        showNotification('A apărut o eroare.');
    });

    
    closeDeleteConfirmationPopup();
});

});

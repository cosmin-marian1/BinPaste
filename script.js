document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('popup');
    const addNoteBtn = document.querySelector('.add-button');
    const closeBtn = document.querySelector('.close-btn');
    const notification = document.getElementById('notification');
    const addNoteErrorMessage = document.getElementById('add-note-error-message');
    const notesContainer = document.getElementById('notes-container');
    const paginationContainer = document.getElementById('pagination');
    let currentPage = 1;
    let activeFullNotePopup = null;

    const searchButton = document.querySelector('.search-button');
    const searchMenu = document.querySelector('.search-menu');

    searchButton.addEventListener('click', () => {
        searchMenu.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!searchButton.contains(event.target) && !searchMenu.contains(event.target)) {
            searchMenu.classList.remove('show');
        }
    });

    addNoteBtn.addEventListener('click', () => {
        popup.style.display = 'block';
        document.body.classList.add('popup-open');
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
            document.body.classList.remove('popup-open');
            document.getElementById('note-form').reset();
            addNoteErrorMessage.textContent = '';
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
                document.getElementById('note-form').reset();
                addNoteErrorMessage.textContent = '';
            }, 300);
        }
    });

    document.querySelector('.search-button').addEventListener('click', function() {
        const searchInput = document.getElementById('search-input');
        
        if (searchInput.style.display === 'none' || searchInput.style.display === '') {
            searchInput.style.display = 'block';
            searchInput.focus();
        } else {
            searchInput.style.display = 'none';
        }
    });

    document.addEventListener('click', function(event) {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.querySelector('.search-button');
    
        if (searchInput.style.display === 'block' && !searchInput.contains(event.target) && !searchButton.contains(event.target)) {
            searchInput.style.display = 'none';
        }
    });

    document.getElementById('search-input').addEventListener('input', async function() {
        const searchValue = this.value.toLowerCase();
    
        try {
            const response = await fetch(`/notes?search=${searchValue}`);
            const data = await response.json();
            displayNotes(data.notes);
        } catch (error) {
            console.error('Eroare la preluarea notelor:', error);
        }
    });

    document.getElementById('note-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const color = document.getElementById('color-picker').value;

        if (title.length > 25) {
            addNoteErrorMessage.textContent = 'Titlul nu poate avea mai mult de 25 de caractere.';
            return;
        } else {
            addNoteErrorMessage.textContent = '';
        }

        try {
            const response = await fetch('/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content, color }),
            });

            if (response.ok) {
                popup.classList.remove('show');
                document.getElementById('note-form').reset();
                notification.classList.add('show');

                setTimeout(() => {
                    notification.classList.remove('show');
                }, 5000);
                fetchNotes(currentPage);
            } else {
                console.error('Eroare la salvarea notei.');
            }
        } catch (error) {
            console.error('Eroare de rețea:', error);
        }
        popup.style.display = 'none';
    });

    async function fetchNotes(page) {
        try {
            const response = await fetch(`/notes?page=${page}`);
            const data = await response.json();
            displayNotes(data.notes);
            setupPagination(data.totalNotes, page);
        } catch (error) {
            console.error('Eroare la preluarea notelor:', error);
        }
    }

    function displayNotes(notes) {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            const noNotesMessage = document.createElement('div');
            noNotesMessage.classList.add('no-notes-message');
            noNotesMessage.textContent = 'There are no notes available :(';
            notesContainer.appendChild(noNotesMessage);
        } else {
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note');
                noteElement.style.backgroundColor = note.color;
            
                noteElement.innerHTML = `
                    <h3>${note.title}</h3>
                    <p>${note.content.substring(0, 25)} (show more)</p>
                    <small>${new Date(note.createdAt).toLocaleString()}</small>
                    <p class="posted-by">Posted By: ${note.postedBy ? note.postedBy : 'Guest'}</p>
                `;
            
                document.querySelector('#notes-container').appendChild(noteElement);

                noteElement.addEventListener('click', () => {
                    if (activeFullNotePopup) {
                        document.body.removeChild(activeFullNotePopup);
                    }

                    const fullNotePopup = document.createElement('div');
                    fullNotePopup.classList.add('full-note-popup');
                    fullNotePopup.innerHTML = `
                         <div class="full-note-content">
                            <h3>${note.title}</h3>
                            <p>${note.content.replace(/\n/g, '<br>')}</p>
                            <small class="data-nota">${new Date(note.createdAt).toLocaleString()}</small>
                              <button class="close-full-note">Close</button>
                          </div>
                    `;
                    document.body.appendChild(fullNotePopup);

                    activeFullNotePopup = fullNotePopup;

                    setTimeout(() => {
                        fullNotePopup.classList.add('show');
                    }, 10);

                    fullNotePopup.querySelector('.close-full-note').addEventListener('click', () => {
                        document.body.removeChild(fullNotePopup);
                        activeFullNotePopup = null;
                        fullNotePopup.classList.remove('show');
                        setTimeout(() => {
                           document.body.removeChild(fullNotePopup);
                        }, 300);
                    });
                });

                notesContainer.appendChild(noteElement);
            });
        }
    }

    function setupPagination(totalNotes, currentPage) {
        paginationContainer.innerHTML = '';
        const totalPages = Math.ceil(totalNotes / 12);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.classList.add('page-btn');
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                fetchNotes(i);
            });
            paginationContainer.appendChild(pageBtn);
        }
    }

    fetchNotes(currentPage);
});

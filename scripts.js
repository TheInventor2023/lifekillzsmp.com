let currentUser = null;

document.getElementById('registerLink').addEventListener('click', function(event) {
    event.preventDefault();
    showForm('registerForm');
});

document.getElementById('loginLink').addEventListener('click', function(event) {
    event.preventDefault();
    showForm('loginForm');
});

document.getElementById('profileLink').addEventListener('click', function(event) {
    event.preventDefault();
    // Load profile data
});

document.getElementById('logoutLink').addEventListener('click', function(event) {
    event.preventDefault();
    currentUser = null;
    hideElement('postThreadForm');
    hideElement('logoutLink');
    hideElement('profileLink');
    showElement('registerLink');
    showElement('loginLink');
    loadThreads();
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value;

    axios.post('https://your-python-backend.herokuapp.com/register', { username, password, email })
        .then(response => {
            if (response.data.success) {
                alert('Registration successful! Please log in.');
                hideForm('registerForm');
            } else {
                alert('Registration failed.');
            }
        });
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    axios.post('https://your-python-backend.herokuapp.com/login', { username, password })
        .then(response => {
            if (response.data.success) {
                currentUser = username;
                hideForm('loginForm');
                showElement('postThreadForm');
                hideElement('registerLink');
                hideElement('loginLink');
                showElement('profileLink');
                showElement('logoutLink');
                loadThreads();
            } else {
                alert('Login failed.');
            }
        });
});

document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail').value;

    axios.post('https://your-python-backend.herokuapp.com/reset_password', { email })
        .then(response => {
            if (response.data.success) {
                alert('Password reset link sent to your email.');
                hideForm('resetPasswordForm');
            } else {
                alert('Password reset failed.');
            }
        });
});

const threadContentEditor = new Quill('#threadContentEditor', {
    theme: 'snow'
});

document.getElementById('postThreadForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('threadTitle').value;
    const content = threadContentEditor.root.innerHTML;

    axios.post('https://your-python-backend.herokuapp.com/post_thread', { title, content, username: currentUser })
        .then(response => {
            if (response.data.success) {
                loadThreads();
                document.getElementById('threadTitle').value = '';
                threadContentEditor.root.innerHTML = '';
            } else {
                alert('Error posting thread');
            }
        });
});

function showForm(formId) {
    hideElement('registerForm');
    hideElement('loginForm');
    hideElement('resetPasswordForm');
    showElement(formId);
}

function hideForm(formId) {
    hideElement(formId);
}

function showElement(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideElement(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

function loadThreads() {
    axios.get('https://your-python-backend.herokuapp.com/get_threads')
        .then(response => {
            const threadsDiv = document.getElementById('threads');
            threadsDiv.innerHTML = '';
            response.data.threads.forEach(thread => {
                const threadElement = document.createElement('div');
                threadElement.classList.add('card', 'thread-card', 'card-body');
                threadElement.innerHTML = `
                    <h5>${thread.title}</h5>
                    <div>${thread.content}</div>
                    <small>Posted by ${thread.username}</small>
                    <div id="comments-${thread.id}" class="mt-4"></div>
                    <form class="commentForm mt-2">
                        <div class="mb-3">
                            <div id="commentContentEditor-${thread.id}" class="editor"></div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
                    </form>`;
                threadsDiv.appendChild(threadElement);

                const commentEditor = new Quill(`#commentContentEditor-${thread.id}`, {
                    theme: 'snow'
                });

                loadComments(thread.id);

                threadElement.querySelector('.commentForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const commentContent = commentEditor.root.innerHTML;
                    axios.post('https://your-python-backend.herokuapp.com/post_comment', { threadId: thread.id, comment: commentContent, username: currentUser })
                        .then(response => {
                            if (response.data.success) {
                                loadComments(thread.id);
                                commentEditor.root.innerHTML = '';
                            } else {
                                alert('Error posting comment');
                            }
                        });
                });
            });
        });
}

function loadComments(threadId) {
    axios.get(`https://your-python-backend.herokuapp.com/get_comments?threadId=${threadId}`)
        .then(response => {
            const commentsDiv = document.getElementById(`comments-${threadId}`);
            commentsDiv.innerHTML = '';
            response.data.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('card', 'comment-card', 'card-body');
                commentElement.innerHTML = `
                    <div>${comment.comment}</div>
                    <small>Posted by ${comment.username}</small>`;
                commentsDiv.appendChild(commentElement);
            });
        });
}

loadThreads();

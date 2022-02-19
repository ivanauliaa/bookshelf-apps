document.addEventListener('DOMContentLoaded', function () {
  const addBookForm = document.getElementById('addBookForm');

  addBookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addBook();
  });

  const searchBooksForm = document.getElementById('searchBooksForm');

  searchBooksForm.addEventListener('submit', function (e) {
    e.preventDefault();
    searchBooks();
  })

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function addBook() {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;
  const isCompleted = document.getElementById('isCompleted').checked;

  const generatedID = generateID();
  const bookObject = generateBookObject(generatedID, title, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateID() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBooks = document.getElementById('books');
  uncompletedBooks.innerHTML = '';

  const completedBooks = document.getElementById('completed-books');
  completedBooks.innerHTML = '';

  for (const book of books) {
    const bookElement = makeBookElement(book);

    if (!book.isCompleted) {
      uncompletedBooks.append(bookElement);
    } else {
      completedBooks.append(bookElement);
    }
  }
});

function makeBookElement(bookObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = `${bookObject.title} (${bookObject.year})`;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textStatus = document.createElement('p');
  const status = bookObject.isCompleted ? 'Selesai dibaca' : 'Belum selesai dibaca';
  textStatus.innerText = `Status: ${status}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textStatus);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(bookObject.id);
    });


    container.append(undoButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function () {
      addBookToCompleted(bookObject.id);
    });

    container.append(checkButton);
  }

  const trashButton = document.createElement('button');
  trashButton.classList.add('trash-button');
  trashButton.addEventListener('click', function () {
    removeBook(bookObject.id);
  });

  container.append(trashButton);

  return container;
}

function addBookToCompleted(bookID) {
  const bookTarget = findBook(bookID);
  if (bookTarget === null) {
    return;
  }

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookID) {
  for (const book of books) {
    if (book.id === bookID) {
      return book;
    }
  }

  return null;
}

function undoBookFromCompleted(bookID) {
  const bookTarget = findBook(bookID);
  if (bookTarget === null) {
    return;
  }

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookID) {
  if (confirm('Kamu yakin ingin menghapus data ini?')) {
    removeTodo(bookID);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function removeTodo(bookID) {
  let index = -1;
  for (const i in books) {
    if (books[i].id === bookID) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    books.splice(index, 1);
  }
}

function saveData() {
  if (isStorageExist()) {
    const jsonStr = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  return typeof (Storage) !== 'undefined';
}

document.addEventListener(SAVED_EVENT, function () {
  alert('Terjadi perubahan data');
})

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBooks() {
  const keyword = document.getElementById('keyword').value.toLowerCase();

  const filteredBooks = books.filter(function (book) {
    return book.title.toLowerCase().includes(keyword);
  });

  const searchBooks = document.getElementById('search-books');
  searchBooks.innerHTML = '';

  for (const book of filteredBooks) {
    const bookElement = makeBookElement(book);

    searchBooks.append(bookElement);
  }
}
class Element {
  book(bookData) {
    let moveButtonLabel = bookData.isCompleted
      ? "Belum dibaca"
      : "Sudah dibaca";

    return `
    <div class="bg-light p-5 my-5" id='container-${bookData.serialNum}'>
      <h2>${bookData.title}</h2>
      <p>Penulis: ${bookData.author}</p>
      <p>Tahun : ${bookData.year}</p>
      <button class="black-button move-book-button" data-id=${bookData.serialNum} 
      container-id='container-${bookData.serialNum}'>${moveButtonLabel}</button>
      <button class="white-button delete-book-button" data-id=${bookData.serialNum} 
      container-id='container-${bookData.serialNum}'>Hapus</button>
    </div>
    `;
  }
}

class PageEvent {
  constructor() {
    this.storageModel = new StorageModel();
    this.elemnt = new Element();
    // prevent the function to loose this contex
    this.bindEvent = this.bindEvent.bind(this);
    this.submitNewBook = this.submitNewBook.bind(this);
    this.bindDeleteEventForButtons = this.bindDeleteEventForButtons.bind(this);
    this.bindMoveEventForButtons = this.bindMoveEventForButtons.bind(this);
    this.deleteBook = this.deleteBook.bind(this);
    this.moveBook = this.moveBook.bind(this);

    this.customEvent = {
      bindMoveBook: "BINDMOVEBOOKEVENT",
      bindDeleteBook: "BINDMOVEBOOKEVENT",
    };
  }

  bindEvent() {
    const newBookForm = document.getElementById("newBookFormId");
    newBookForm.addEventListener("submit", this.submitNewBook);
    // create event to register event for move books action
    document.addEventListener(
      this.customEvent.bindMoveBook,
      this.bindMoveEventForButtons
    );

    //create event to register event to delete book action
    document.addEventListener(
      this.customEvent.bindDeleteBook,
      this.bindDeleteEventForButtons
    );
    this.showInCompleteBooks();
    this.showReadedBooks();
    document.dispatchEvent(new Event(this.customEvent.bindDeleteBook));
    document.dispatchEvent(new Event(this.customEvent.bindMoveBook));
  }

  showReadedBooks() {
    return this.showBooks("completedBookContainerId");
  }

  showInCompleteBooks() {
    return this.showBooks("inCompletedBookContainerId", false);
  }

  showBooks(containerId, isCompletedReading = true) {
    let filterByCompletedStatus = (book) => {
      return book.isCompleted === isCompletedReading;
    };

    let books = this.storageModel.getBooks();
    let booksElement = books
      .filter(filterByCompletedStatus)
      .map(this.elemnt.book);

    let completedBookContainer = document.getElementById(containerId);

    for (let bookElement of booksElement) {
      completedBookContainer.innerHTML += bookElement;
    }
  }

  submitNewBook(evnt) {
    //   prevent refresh
    evnt.preventDefault();
    const formData = this.serializeBookForm();
    const serialNum = this.storageModel.generateSerialNum();
    formData.serialNum = serialNum;
    this.storageModel.saveNewBook(serialNum, formData);
    this.storageModel.updateBookList(serialNum);
  }

  serializeBookForm() {
    const newBookForm = document.getElementById("newBookFormId");
    // new formData is used to get all data in form,
    // object.fromEntries is used to convert formdata object to json
    const newBookData = Object.fromEntries(new FormData(newBookForm));
    if (newBookData.isCompleted) {
      newBookData.isCompleted = true;
    } else {
      newBookData.isCompleted = false;
    }
    return newBookData;
  }

  bindMoveEventForButtons() {
    let moveButtons = document.getElementsByClassName("move-book-button");
    for (let button of moveButtons) {
      button.onclick = this.moveBook;
    }
  }

  bindDeleteEventForButtons() {
    let moveButtons = document.getElementsByClassName("delete-book-button");
    for (let button of moveButtons) {
      button.onclick = this.deleteBook;
    }
  }

  deleteBook(event) {
    let containerId = event.target.getAttribute("container-id");
    let bookId = event.target.getAttribute("data-id");

    // remove from localStorage
    this.storageModel.removeBook(bookId);

    // remove from page
    let containerElement = document.getElementById(containerId);
    containerElement.remove();
  }
  moveBook(event) {
    let containerId = event.target.getAttribute("container-id");
    let bookId = event.target.getAttribute("data-id");

    // update completed status
    this.storageModel.updateCompletedStatus(bookId);

    // move book
    let containerElement = document.getElementById(containerId);
    let copyOfContainerElement = containerElement.cloneNode(true);
    let parentContainerName = containerElement.parentElement.getAttribute("id");

    if (parentContainerName == "inCompletedBookContainerId") {
      document
        .getElementById("completedBookContainerId")
        .appendChild(copyOfContainerElement);
    } else {
      document
        .getElementById("inCompletedBookContainerId")
        .appendChild(copyOfContainerElement);
    }
    containerElement.remove();

    // Element the move to another place lose his event, we need to rebind them.
    document.dispatchEvent(new Event(this.customEvent.bindDeleteBook));
    document.dispatchEvent(new Event(this.customEvent.bindMoveBook));
  }
}

class StorageModel {
  constructor() {
    this.keys = {
      serialNum: "BOOKSERIALNUM",
      bookList: "BOOKLIST",
      bookIdPrefix: "BOOK",
    };
  }

  /**Do check, is the browser is suporting Storage or not. */
  isStorageSuported() {
    if (typeof (Storage === undefined)) {
      console.info("Storage is not suported");
      return false;
    }
    return true;
  }

  saveNewBook(key, book) {
    localStorage.setItem(this.keys.bookIdPrefix + key, JSON.stringify(book));
  }
  updateBookList(newBookKey) {
    let bookKeys = localStorage.getItem(this.keys.bookList);
    if (bookKeys) {
      bookKeys = JSON.parse(bookKeys);
    } else {
      bookKeys = [];
    }
    bookKeys.push(this.keys.bookIdPrefix + newBookKey);

    localStorage.setItem(this.keys.bookList, JSON.stringify(bookKeys));
  }
  removeBook(bookId) {
    // remove record
    localStorage.removeItem(`${this.keys.bookIdPrefix}${bookId}`);

    // remove from list of books
    let booksId = JSON.parse(localStorage.getItem(this.keys.bookList));
    booksId = booksId.filter((randomBookId) => {
      return randomBookId != `${this.keys.bookIdPrefix}${bookId}`;
    });

    // update book
    localStorage.setItem(this.keys.bookList, JSON.stringify(booksId));
  }
  updateCompletedStatus(bookId) {
    let book = JSON.parse(
      localStorage.getItem(`${this.keys.bookIdPrefix}${bookId}`)
    );
    book.isCompleted = !book.isCompleted;

    localStorage.setItem(
      `${this.keys.bookIdPrefix}${bookId}`,
      JSON.stringify(book)
    );
  }

  generateSerialNum() {
    let serialNum = localStorage.getItem(this.keys.serialNum);
    if (serialNum) {
      serialNum = parseInt(serialNum) + 1;
    } else {
      serialNum = 1;
    }
    this.updateSerialNum(serialNum);
    return serialNum;
  }

  updateSerialNum(newSerialNum) {
    localStorage.setItem(this.keys.serialNum, newSerialNum);
  }
  getBooks() {
    let booksId = JSON.parse(localStorage.getItem(this.keys.bookList));
    let books = [];
    for (let id of booksId) {
      let book = JSON.parse(localStorage.getItem(id));
      books.push(book);
    }
    return books;
  }
}

/**Bind event on first load */
document.addEventListener("DOMContentLoaded", new PageEvent().bindEvent);

class Element {
  book(bookData) {
    return `
    <div class="bg-light p-5 my-5">
      <h2>${bookData.title}</h2>
      <p>Penulis: ${bookData.author}</p>
      <p>Tahun : ${bookData.year}</p>
      <button class="black-button" data-id=${bookData.serialNum}>Sudah dibaca</button>
      <button class="white-button" data-id=${bookData.serialNum}>Hapus</button>
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
  }

  bindEvent() {
    const newBookForm = document.getElementById("newBookFormId");
    newBookForm.addEventListener("submit", this.submitNewBook);
    this.showInCompleteBooks();
    this.showReadedBooks();
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

  generateSerialNum() {
    let serialNum = localStorage.getItem(this.keys.serialNum);
    if (serialNum) {
      serialNum = parseInt(serialNum) + 1;
    } else {
      serialNum = 1;
    }
    this.updateSerialNum(serialNum);
    console.log(serialNum);
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

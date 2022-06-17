class PageEvent {
  constructor() {
    // prevent the function to loose this contex
    this.bindEvent = this.bindEvent.bind(this);
    this.submitNewBook = this.submitNewBook.bind(this);
  }

  bindEvent() {
    const newBookForm = document.getElementById("newBookFormId");
    newBookForm.addEventListener("submit", this.submitNewBook);
  }
  submitNewBook(evnt) {
    //   prevent refresh
    evnt.preventDefault();

    const formData = this.serializeBookForm();
    console.log(formData);
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

  generateSerialNum() {
    let serialNum = localStorage.getItem(this.keys.serialNum);
    if (serialNum) {
      this.updateSerialNum(serialNum + 1);
      return serialNum + 1;
      return 1;
    }
  }

  updateSerialNum(newSerialNum) {
    localStorage.setItem(this.keys.serialNum, newSerialNum);
  }
}

/**Bind event on first load */
document.addEventListener("DOMContentLoaded", new PageEvent().bindEvent);

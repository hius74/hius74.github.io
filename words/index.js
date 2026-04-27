// src/util/database.ts
var dbName = "cards";
var cardsObjectStoreName = "cards";
var cardsObjectStoreNamesIndexName = "name_index";
var cardsObjectStoreNextTimeIndexName = "next_time_index";
var version = 1;
var db = await open();
async function open() {
  return new Promise((resolve, error) => {
    const request = window.indexedDB.open(dbName, version);
    request.onerror = () => {
      error(request.error);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      const db2 = request.result;
      const objectStore = db2.createObjectStore(cardsObjectStoreName, {
        keyPath: "id",
        autoIncrement: true
      });
      const namePath = "name";
      objectStore.createIndex(cardsObjectStoreNamesIndexName, namePath, { unique: true });
      const nextTimePath = "nextTime";
      objectStore.createIndex(cardsObjectStoreNextTimeIndexName, nextTimePath);
    };
  });
}
async function dbGetFirstCards(limit = 10) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([cardsObjectStoreName]);
    if (transaction == null) {
      reject("Can not create transaction");
    } else {
      const objectStore = transaction.objectStore(cardsObjectStoreName);
      if (objectStore == null) {
        reject("Can not find object store");
      } else {
        const index = objectStore?.index(cardsObjectStoreNextTimeIndexName);
        if (index == null) {
          reject("Can not open index");
        } else {
          const request = index.openCursor(IDBKeyRange.lowerBound(0, false));
          const results = [];
          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (!cursor || results.length >= limit) {
              resolve(results);
            } else {
              results.push(cursor.value);
              cursor.continue();
            }
          };
          request.onerror = () => {
            reject(request.error);
          };
        }
      }
    }
  });
}
async function dbNextStage(id, level, nextTime) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([cardsObjectStoreName], "readwrite");
    if (transaction == null) {
      reject("Can not create transaction");
    } else {
      const objectStore = transaction.objectStore(cardsObjectStoreName);
      if (objectStore == null) {
        reject("Can not find object store");
      } else {
        const getRequest = objectStore.get(id);
        let existingCard;
        getRequest.onsuccess = () => {
          existingCard = getRequest.result;
          if (existingCard) {
            const putRequest = objectStore.put({
              ...existingCard,
              level,
              nextTime
            });
            putRequest.onerror = () => reject(putRequest.error);
          }
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      }
    }
  });
}

// src/util/dom.ts
function getElementById(id, ctor) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element #${id} not found`);
  }
  if (!(el instanceof ctor)) {
    throw new Error(`Element #${id} is not of expected type`);
  }
  return el;
}

// src/page/index.ts
var cards = await dbGetFirstCards(10);
var cardIdx = -1;
var cardFaceIdx = 0;
var errorAnswer = false;
var progressElement = getElementById("progress", HTMLProgressElement);
progressElement.value = 0;
progressElement.max = cards.length;
var cardElement = getElementById("card", HTMLDivElement);
var helpElement = getElementById("help", HTMLButtonElement);
helpElement.addEventListener("click", () => {
  help();
});
var inputElement = getElementById("answer", HTMLInputElement);
inputElement.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const value = inputElement.value;
    const card = cards[cardIdx];
    if (card.name === value) {
      if (!errorAnswer) {
        const { level, nextTime } = calculateNextTime(card);
        await dbNextStage(card.id, level, nextTime);
      }
      newCard();
    } else {
      errorAnswer = true;
      inputElement.value = card.name;
    }
  }
});
function help() {
  if (cardIdx < cards.length) {
    cardFaceIdx++;
    const card = cards[cardIdx];
    if (cardFaceIdx < card.sides.length - 1) {
      cardElement.innerHTML = card.sides[cardFaceIdx];
    } else {
      helpElement.disabled = true;
    }
  }
}
function newCard() {
  cardIdx++;
  if (cardIdx < cards.length) {
    const card = cards[cardIdx];
    progressElement.value = cardIdx;
    cardFaceIdx = 0;
    cardElement.innerHTML = card.sides[cardFaceIdx];
    helpElement.disabled = cards[cardIdx].sides.length >= 2;
    inputElement.value = "";
    errorAnswer = false;
  } else {
    alert("Finished");
  }
}
function calculateNextTime(card) {
  return {
    level: card.level + 1,
    nextTime: card.nextTime + card.level * 3 * 60 * 60 * 1e3
  };
}
if (cards.length > 0) {
  newCard();
} else {
  cardElement.innerHTML = 'No card found to learn. Please <a href="./settings.html">load cards.</a>';
  helpElement.disabled = true;
  inputElement.disabled = true;
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((reg) => console.log("Service Worker Registered!")).catch((err) => console.log("Registration failed:", err));
  });
}

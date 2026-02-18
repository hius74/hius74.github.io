(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
const SETTINGS_KEY = "words_settings";
function updateSettings(settings) {
  const newSettings = {
    ...loadSettings(),
    ...settings
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
}
function loadSettings() {
  const json = localStorage.getItem(SETTINGS_KEY);
  return json == null ? {} : JSON.parse(json);
}
function extractWord(text, index) {
  if (index < 0 || index >= text.length) {
    return null;
  }
  if (!isWordChar(text[index])) {
    return null;
  }
  let start = index;
  let end = index;
  while (start > 0 && isWordChar(text[start - 1])) {
    start--;
  }
  while (end < text.length - 1 && isWordChar(text[end + 1])) {
    end++;
  }
  return text.slice(start, end + 1);
}
function isWordChar(char) {
  return new RegExp("\\p{L}", "u").test(char);
}
function initDropArea(dropArea, wordText) {
  const settings = loadSettings();
  dropArea.value = settings.text || "";
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  dropArea.addEventListener("drop", async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    const text = await readTextFile(file);
    dropArea.value = text;
    updateSettings({
      text,
      filename: file.name
    });
  });
  dropArea.addEventListener("close", () => {
    updateSettings({
      text: dropArea.value
    });
  });
  dropArea.addEventListener("click", (e) => {
    const position = document.caretPositionFromPoint(e.clientX, e.clientY);
    if (position == null) return;
    const word = extractWord(dropArea.value, position.offset);
    if (word != null) {
      wordText.value = word;
    }
  });
}
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
function increaseFont(editor) {
  const settings = loadSettings();
  const fontSize = (settings.fontSize || 14) + 1;
  console.log("New font size: ", fontSize);
  editor.style.fontSize = fontSize + "px";
  updateSettings({
    fontSize
  });
}
function decreaseFont(editor) {
  const settings = loadSettings();
  const fontSize = Math.max((settings.fontSize || 14) - 1, 8);
  console.log("New font size: ", fontSize);
  editor.style.fontSize = fontSize + "px";
  updateSettings({
    fontSize
  });
}
function bootstrap() {
  const editor = getElementById("editor", HTMLTextAreaElement);
  const wordText = getElementById("word", HTMLInputElement);
  const fontDecrease = getElementById("font_decrease", HTMLButtonElement);
  const fontIncrease = getElementById("font_increase", HTMLButtonElement);
  initDropArea(editor, wordText);
  fontDecrease.addEventListener("click", () => decreaseFont(editor));
  fontIncrease.addEventListener("click", () => increaseFont(editor));
  getElementById("save", HTMLButtonElement).addEventListener("click", () => {
    const text = editor.value;
    if (text.length > 1) {
      updateSettings({
        text
      });
    }
  });
  getElementById("download", HTMLButtonElement).addEventListener("click", () => {
    const settings = loadSettings();
    if (settings.text && settings.text.length > 1) {
      const blob = new Blob([settings.text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = settings.filename || "words.txt";
      a.click();
    }
  });
}
document.addEventListener("DOMContentLoaded", bootstrap);

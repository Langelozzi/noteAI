'use strict';

import './popup.css';

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

function getSelectedText() {
    var text = "";

    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        // if they are using internet explorer
        text = document.selection.createRange().text;
    }

    text = text.replace(/[^A-Za-z0-9,\.,?!() ]/g, " ");
    return text;
}

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getGeneratedNotes(prompt) {
    try {
        const response = await fetch("http://localhost:3000/create-notes", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: prompt })
        })

        const data = await response.json();
        return data.notes;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function submitQuery(selectedText) {
    const resultDiv = document.getElementById("result-container");
    const resultCard = document.querySelector(".bg-card");

    // show the popup
    resultCard.classList.remove("hidden");
    // clear the results
    resultDiv.innerHTML = "";

    // show the loading spinner
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.classList.remove("hidden");

    // send request
    const notes = await getGeneratedNotes(selectedText);

    if (notes && notes.includes("\n-")) {
        let formattedResults = "<ul>";

        notes
            .split("\n-")
            .slice(1)
            .forEach((element) => {
                formattedResults += `<li class="note-bullet">${element.trim()}</li>`;
            });

        formattedResults += "</ul>";

        resultDiv.innerHTML = formattedResults;
    } else if (notes && notes.includes("•")) {
        let formattedResults = "<ul>";

        notes
            .split("•")
            .slice(1)
            .forEach((element) => {
                formattedResults += `<li class="note-bullet">${element.trim()}</li>`;
            });

        formattedResults += "</ul>";

        resultDiv.innerHTML = formattedResults;
    } else if (notes && notes.includes("*")) {
        let formattedResults = "<ul>";

        notes
            .split("*")
            .slice(1)
            .forEach((element) => {
                formattedResults += `<li class="note-bullet">${element.trim()}</li>`;
            });

        formattedResults += "</ul>";

        resultDiv.innerHTML = formattedResults;
    } else if (notes && !notes.includes("-") && !notes.includes("•")) {
        let formattedResults = "<ul>";

        notes
            .split(".")
            .slice(1)
            .forEach((element) => {
                formattedResults += `<li class="note-bullet">${element.trim()}</li>`;
            });

        formattedResults += "</ul>";

        resultDiv.innerHTML = formattedResults;
    } else {
        resultDiv.innerHTML =
            '<p class="error-msg">Error: Could not generate notes, please try again.</p>';
    }

    // hide the loading spinner
    loadingSpinner.classList.add("hidden");
}

function tooLittleWordError() {
    // shake the button
    const generateBtn = document.getElementById("generate-btn");
    generateBtn.classList.add("btn-error");

    const errorMessageParagraph = document.getElementById("error-msg");
    errorMessageParagraph.classList.remove("hidden");
    errorMessageParagraph.innerHTML = "ERROR: Please select more than 10 words.";

    // stop button shake
    setTimeout(() => {
        generateBtn.classList.remove("btn-error");
    }, 800);
}

function tooManyWords() {
    // shake the button
    const generateBtn = document.getElementById("generate-btn");
    generateBtn.classList.add("btn-error");

    const errorMessageParagraph = document.getElementById("error-msg");
    errorMessageParagraph.classList.remove("hidden");
    errorMessageParagraph.innerHTML =
        "ERROR: Please limit your selection to less than 2000 words.";

    // stop button shake
    setTimeout(() => {
        generateBtn.classList.remove("btn-error");
    }, 800);
}

async function onClickHandler() {
    const tab = await getCurrentTab();
    let selectedText = "";

    if (tab.url.includes(".pdf")) {
        selectedText = getClipboardContents();
    } else {
        // executes the script in the context of the current tab
        const scriptRes = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: getSelectedText,
        });
        selectedText = scriptRes[0].result;
    }

    if (!selectedText || countWords(selectedText) < 10) {
        tooLittleWordError();
    } else if (countWords(selectedText) > 2000) {
        tooManyWords();
    } else {
        submitQuery(selectedText);
    }
}

function CopyToClipboard() {
    var element = document.getElementById("result-container");
    var elementText = element.innerHTML
        .replaceAll('<li class="note-bullet">', "")
        .replaceAll("</li>", "\n")
        .replaceAll("<ul>", "")
        .replaceAll("</ul>", "");
    navigator.clipboard.writeText(elementText);
}

function getClipboardContents() {
    const textarea = document.getElementById("clipboard-contents");
    textarea.select()

    document.execCommand("paste");

    const data = textarea.value;
    textarea.val = "";

    return data;
}

function handleCopyButton() {
    CopyToClipboard();

    const messageParagraph = document.getElementById("msg");
    messageParagraph.classList.remove("hidden");
    messageParagraph.innerHTML = "Copied to clipboard!";

    setTimeout(() => {
        messageParagraph.classList.add("hidden");
    }, 3000);
}

// Listeners
document
    .getElementById("generate-btn")
    .addEventListener("click", onClickHandler);

document.getElementById("copy-btn").addEventListener("click", handleCopyButton);

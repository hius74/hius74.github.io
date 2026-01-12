import { LocalStorageRepository } from '../repositories/localStorageRepository.js';
import { dutchGrammarSettings } from '../settings/dutchGrammarSettings.js';
/**
 * Construct table for Dutch Grammar (Klara Taal)
 */
// Display results in Table
function displayTableBody() {
    const bodyElement = document.getElementById('dutch_grammar-table-body');
    bodyElement?.replaceChildren();
    const ds = new LocalStorageRepository(dutchGrammarSettings.storageName);
    for (const lesson of ds.lessons4table()) {
        const rowElement = document.createElement('tr');
        bodyElement?.appendChild(rowElement);
        const dateElement = document.createElement('td');
        dateElement.innerText = new Date(lesson.date).toISOString().substring(0, 10);
        rowElement.appendChild(dateElement);
        /* const testElement = document.createElement('td');
        testElement.innerText = lesson.isTest ? '\u2611' : '\u2610';
        rowElement.appendChild(testElement); */
        const lessonElement = document.createElement('td');
        lessonElement.innerText = String(lesson.lesson);
        rowElement.appendChild(lessonElement);
        const pageElement = document.createElement('td');
        pageElement.innerText = String(lesson.page);
        rowElement.appendChild(pageElement);
        const answerElement = document.createElement('td');
        answerElement.innerText = String(lesson.answer);
        rowElement.appendChild(answerElement);
        const scoreElement = document.createElement('td');
        scoreElement.innerText = '\u2605'.repeat(lesson.score) + '\u2606'.repeat(5 - lesson.score);
        rowElement.appendChild(scoreElement);
        const actionElement = document.createElement('td');
        actionElement.innerHTML = `<a href="${dutchGrammarSettings.editPage}?${dutchGrammarSettings.idParamName}=${lesson.date}">Edit</a>`;
        rowElement.appendChild(actionElement);
    }
}
// Add a finished lesson
document.getElementById('dutch-grammar').addEventListener('submit', () => {
    const ds = new LocalStorageRepository(dutchGrammarSettings.storageName);
    const lessonElement = document.getElementById('dutch-grammar-lesson');
    const testElement = document.getElementById('dutch-grammar-test');
    const pageElement = document.getElementById('dutch-grammar-page');
    const answerElement = document.getElementById('dutch-grammar-answer');
    const scoreElement = document.getElementById('dutch-grammar-score');
    ds.setLesson({
        answer: Number(answerElement.value),
        date: Date.now(),
        isTest: Boolean(testElement?.checked || false),
        lesson: Number(lessonElement.value),
        page: Number(pageElement.value),
        score: Number(scoreElement.value),
    });
    lessonElement.value = '';
    if (testElement) {
        testElement.checked = false;
    }
    pageElement.value = '';
    answerElement.value = '';
    scoreElement.value = '';
    displayTableBody();
});
displayTableBody();

import { LocalStorageRepository } from '../repositories/localStorageRepository.js';
import { dutchGrammarSettings } from '../settings/dutchGrammarSettings.js';
/**
 * Set form element data
 */
function setFormData() {
    const params = new URLSearchParams(document.location.search);
    const id = params.get(dutchGrammarSettings.idParamName);
    const storage = new LocalStorageRepository(dutchGrammarSettings.storageName);
    if (id) {
        const lessons = storage.getAllLessons();
        const idx = lessons.findIndex((l) => l.date.toString() === id);
        const lesson = lessons[idx];
        if (lesson) {
            const lessonElement = document.getElementById('dutch-grammar-lesson');
            const testElement = document.getElementById('dutch-grammar-test');
            const pageElement = document.getElementById('dutch-grammar-page');
            const answerElement = document.getElementById('dutch-grammar-answer');
            const scoreElement = document.getElementById('dutch-grammar-score');
            lessonElement.value = String(lesson.lesson);
            testElement.checked = lesson.isTest;
            pageElement.value = String(lesson.page);
            answerElement.value = String(lesson.answer);
            scoreElement.value = String(lesson.score);
            const deleteButton = document.getElementById('dutch-grammar-delete');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    storage.deleteLessonByIdx(idx);
                    window.location.replace(dutchGrammarSettings.tablePage);
                });
            }
            const form = document.getElementById('dutch-grammar');
            if (form) {
                form.addEventListener('submit', () => {
                    lesson.date = Date.now();
                    lesson.lesson = Number(lessonElement.value);
                    lesson.isTest = Boolean(testElement.checked);
                    lesson.page = Number(pageElement.value);
                    lesson.answer = Number(answerElement.value);
                    lesson.score = Number(scoreElement.value);
                    storage.setLesson(lesson);
                    window.location.replace(dutchGrammarSettings.tablePage);
                });
            }
        }
        else {
            console.log('No Lesson id', id);
        }
    }
    else {
        console.log('No lesson id', document.location.search);
    }
}
setFormData();

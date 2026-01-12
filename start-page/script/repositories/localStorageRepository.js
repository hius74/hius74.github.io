// Lesson number for "Deel 2"
const minLessonNumber = 53;
export class LocalStorageRepository {
    name;
    constructor(name) {
        this.name = name;
    }
    getAllLessons() {
        const data = localStorage.getItem(this.name);
        return data ? JSON.parse(data) : [];
    }
    /**
     * Return lessons to display in a table.
     */
    lessons4table() {
        return this.getAllLessons().filter((l) => l.lesson >= minLessonNumber);
    }
    setLesson(lesson) {
        const lessons = this.getAllLessons();
        const old = lessons.find((l) => l.lesson === lesson.lesson && l.isTest === lesson.isTest);
        if (old) {
            old.date = lesson.date;
            old.page = lesson.page;
            old.answer = lesson.answer;
            old.score = lesson.score;
        }
        else {
            lessons.push(lesson);
        }
        this.saveAllLesson(lessons);
    }
    deleteLessonByIdx(idx) {
        const lessons = this.getAllLessons();
        lessons.splice(idx, 1);
        this.saveAllLesson(lessons);
    }
    static sort(lessons) {
        lessons.sort((l1, l2) => l2.page - l1.page);
    }
    saveAllLesson(lessons) {
        LocalStorageRepository.sort(lessons);
        localStorage.setItem(this.name, JSON.stringify(lessons));
    }
}

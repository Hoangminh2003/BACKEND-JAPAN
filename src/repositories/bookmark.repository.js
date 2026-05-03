import Bookmark from "../models/bookmark.model.js";
import BaseRepository from "./base.repository.js";

class BookmarkRepository extends BaseRepository {
    constructor() {
        super(Bookmark);
    }

    async toggle(userId, examId, questionId, sectionType) {
        const existing = await this.findOne({ user: userId, examId, questionId });
        if (existing) {
            await existing.deleteOne();
            return { bookmarked: false };
        }
        await this.create({ user: userId, examId, questionId, sectionType });
        return { bookmarked: true };
    }

}
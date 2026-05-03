import ExamAttempt from "../models/exam-attempt.model.js";
import BaseRepository from "./base.repository.js";

class ExamAttemptRepository extends BaseRepository {
    constructor() {
        super(ExamAttempt);
    }

    async findInProgress(userId, examId, mode = "full_test") {
        return this.findOne({
            user: userId,
            exam: examId,
            status: "in_progress",
            mode,
        });
    }

    async findAllInProgress(userId) {
        return this.find(
            { user: userId, status: "in_progress" },
            {
                populate: { path: "exam", select: "title examCode level duration" },
                select: "exam mode startTime allowedDuration",
                sort: { startTime: -1 },
                limit: 5,
            },
        );
    }

    async getWithUser(attemptId) {
        return this.findById(attemptId, {
            populate: { path: "user", select: "fullName email" },
        });
    }
}

export default new ExamAttemptRepository();
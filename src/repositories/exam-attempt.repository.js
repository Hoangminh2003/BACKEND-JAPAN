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

    async getWithExamAndUser(attemptId) {
        return this.findById(attemptId, {
            populate: [{ path: "exam" }, { path: "user", select: "fullName email" }],
        });
    }

    async getUserAttempts({ userId, page = 1, limit = 20, examId, status, search, examIds }) {
        const filter = { user: userId };

        if (examId) filter.exam = examId;
        if (status) filter.status = status;
        if (examIds) filter.exam = { $in: examIds };

        return this.paginate(filter, {
            page,
            limit,
            sort: { startTime: -1 },
            select: "-answers",
            populate: { path: "exam", select: "title examCode level totalPoints duration" },
        });
    }

}

export default new ExamAttemptRepository();
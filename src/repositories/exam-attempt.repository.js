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

    async getRecentSubmitted(limitCount = 10) {
        return this.find(
            { status: "submitted" },
            {
                populate: [
                    { path: "user", select: "fullName email" },
                    { path: "exam", select: "title examCode level" },
                ],
                select: "user exam results.totalScore results.passed startTime",
                sort: { startTime: -1 },
                limit: limitCount,
            },
        );
    }

    /**
     * Streak – số ngày liên tiếp có bài submitted (tính từ hôm nay lùi ngược).
     */
    async getStreak(userId) {
        const days = await this.aggregate([
            { $match: { user: userId, status: "submitted" } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$startTime" },
                    },
                },
            },
            { $sort: { _id: -1 } },
        ]);

        if (!days.length) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < days.length; i++) {
            const d = new Date(days[i]._id);
            d.setHours(0, 0, 0, 0);
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            expected.setHours(0, 0, 0, 0);

            if (d.getTime() === expected.getTime()) {
                streak++;
            } else if (i === 0 && streak === 0) {
                // If no exam today, shift by 1 day
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                if (d.getTime() === yesterday.getTime()) {
                    streak = 1;
                    today.setDate(today.getDate() - 1); // shift base
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        return streak;
    }

    /**
     * Điểm theo ngày (scores by day) – last N days.
     */
    async getScoresByDay(userId, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);

        return this.aggregate([
            { $match: { user: userId, status: "submitted", startTime: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    avgPercentage: { $avg: "$results.percentage" },
                    bestPercentage: { $max: "$results.percentage" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    /**
     * Điểm trung bình theo kỹ năng (radar chart).
     */
    async getScoresBySection(userId) {
        return this.aggregate([
            { $match: { user: userId, status: "submitted" } },
            { $unwind: "$results.sectionScores" },
            {
                $group: {
                    _id: "$results.sectionScores.sectionType",
                    avgScore: {
                        $avg: {
                            $cond: [
                                { $gt: ["$results.sectionScores.totalQuestions", 0] },
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                "$results.sectionScores.correctAnswers",
                                                "$results.sectionScores.totalQuestions",
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                0,
                            ],
                        },
                    },
                    totalAttempts: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }

    
    /**
     * Tỷ lệ đúng sai theo cấp độ (bar chart data).
     */
    async getAccuracyByLevel(userId) {
        return this.aggregate([
            { $match: { user: userId, status: "submitted" } },
            {
                $lookup: {
                    from: "exams",
                    localField: "exam",
                    foreignField: "_id",
                    as: "examData",
                },
            },
            { $unwind: "$examData" },
            {
                $group: {
                    _id: "$examData.level",
                    totalCorrect: { $sum: "$results.correctAnswers" },
                    totalWrong: { $sum: "$results.wrongAnswers" },
                    totalSkipped: { $sum: "$results.skippedAnswers" },
                    avgPercentage: { $avg: "$results.percentage" },
                    attempts: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }





}

export default new ExamAttemptRepository();
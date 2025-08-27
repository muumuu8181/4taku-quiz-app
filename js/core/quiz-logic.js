// クイズ選択ロジック（コア機能）
class QuizLogic {
    constructor() {
        this.QUESTIONS_PER_ROUND = 5;
    }

    // 配列シャッフル
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 段階的問題選択（1回目→2回目→3回目→適応学習）
    selectQuestionsWithAdaptiveLearning(allQuizRecords, allQuestions, logger = null) {
        const totalQuestions = allQuestions.length;
        
        // 各問題の出現回数をカウント
        const questionAppearanceCount = {};
        allQuestions.forEach(q => {
            questionAppearanceCount[q.id] = 0;
        });
        
        allQuizRecords.forEach(record => {
            if (questionAppearanceCount.hasOwnProperty(record.questionId)) {
                questionAppearanceCount[record.questionId]++;
            }
        });
        
        // 最小出現回数を取得（現在のフェーズを判定）
        const minAppearanceCount = Math.min(...Object.values(questionAppearanceCount));
        const maxAppearanceCount = Math.max(...Object.values(questionAppearanceCount));
        
        if (logger) {
            logger(`=== フェーズ判定デバッグ ===`);
            logger(`総問題数: ${totalQuestions}問`);
            logger(`最小出現回数: ${minAppearanceCount}回`);
            logger(`最大出現回数: ${maxAppearanceCount}回`);
        }
        
        // 第1フェーズ: まだ1回も出題されていない問題がある
        if (minAppearanceCount === 0) {
            if (logger) logger(`第1フェーズ: 全問題1回目を完了中`);
            return this.selectQuestionsForPhase(1, allQuizRecords, allQuestions, logger);
        }
        
        // 第2フェーズ: まだ2回目が完了していない問題がある
        if (minAppearanceCount === 1) {
            if (logger) logger(`第2フェーズ: 全問題2回目を完了中`);
            return this.selectQuestionsForPhase(2, allQuizRecords, allQuestions, logger);
        }
        
        // 第3フェーズ: まだ3回目が完了していない問題がある
        if (minAppearanceCount === 2) {
            if (logger) logger(`第3フェーズ: 全問題3回目を完了中`);
            return this.selectQuestionsForPhase(3, allQuizRecords, allQuestions, logger);
        }
        
        // 第4フェーズ以降: 全問題が3回ずつ完了済み → 適応学習開始
        if (logger) logger(`適応学習フェーズ: 全${totalQuestions}問が3回ずつ完了済み`);
        return this.selectQuestionsBasedOnAccuracy(allQuizRecords, allQuestions, logger);
    }

    // フェーズ別問題選択（指定回数に達していない問題を優先）
    selectQuestionsForPhase(targetCount, allQuizRecords, allQuestions, logger = null) {
        const questionAppearanceCount = {};
        allQuestions.forEach(q => {
            questionAppearanceCount[q.id] = 0;
        });
        
        // 各問題の出現回数をカウント
        allQuizRecords.forEach(record => {
            if (questionAppearanceCount.hasOwnProperty(record.questionId)) {
                questionAppearanceCount[record.questionId]++;
            }
        });
        
        if (logger) {
            logger(`=== フェーズ${targetCount} デバッグ ===`);
            logger(`総回答数: ${allQuizRecords.length}`);
            const counts = Object.entries(questionAppearanceCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            logger(`出現回数TOP5: ${counts.map(([id, count]) => `${id}:${count}`).join(', ')}`);
        }
        
        // まだtargetCount回に達していない問題を抽出（厳格チェック）
        const availableQuestions = allQuestions.filter(q => {
            const count = questionAppearanceCount[q.id];
            const isAvailable = count < targetCount;
            if (!isAvailable && logger) {
                logger(`⛔ ${q.id} は${count}回出題済みのためスキップ`);
            }
            return isAvailable;
        });
        
        if (logger) {
            logger(`フェーズ${targetCount}: 選択可能問題 ${availableQuestions.length}問`);
            logger(`選択可能: ${availableQuestions.map(q => q.id).join(', ')}`);
        }
        
        if (availableQuestions.length === 0) {
            if (logger) logger('🚨 エラー: 選択可能問題がありません！');
            // フォールバック：回数が最も少ない問題を選択
            const minCount = Math.min(...Object.values(questionAppearanceCount));
            const fallbackQuestions = allQuestions.filter(q => 
                questionAppearanceCount[q.id] === minCount
            );
            if (logger) logger(`フォールバック: 最少回数(${minCount}回)問題から選択`);
            return this.shuffleArray(fallbackQuestions).slice(0, this.QUESTIONS_PER_ROUND);
        }
        
        // 選択可能問題からランダムに5問選択
        const shuffled = this.shuffleArray(availableQuestions);
        const selected = shuffled.slice(0, Math.min(this.QUESTIONS_PER_ROUND, shuffled.length));
        
        if (logger) {
            logger(`✅ 選択された問題: ${selected.map(q => `${q.id}(${questionAppearanceCount[q.id]}回)`).join(', ')}`);
        }
        
        return selected;
    }

    // 正解率ベース問題選択
    selectQuestionsBasedOnAccuracy(allQuizRecords, allQuestions, logger = null) {
        const stats = new StatisticsCalculator().calculateStatistics(allQuizRecords, allQuestions);
        const questionPool = [];
        
        allQuestions.forEach(question => {
            const questionStat = stats.questionStats.find(s => s.questionId === question.id);
            let weight;
            
            if (!questionStat || questionStat.attempts === 0) {
                weight = 5;
                if (logger) logger(`${question.id}: 未挑戦 - 出題重み${weight}`);
            } else {
                const accuracy = questionStat.accuracy;
                if (accuracy < 50) {
                    weight = 4;
                    if (logger) logger(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
                } else if (accuracy < 80) {
                    weight = 2;
                    if (logger) logger(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
                } else {
                    weight = 1;
                    if (logger) logger(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
                }
            }
            
            for (let i = 0; i < weight; i++) {
                questionPool.push(question);
            }
        });
        
        const shuffled = this.shuffleArray(questionPool);
        const selectedQuestions = [];
        const usedQuestionIds = new Set();
        
        for (const question of shuffled) {
            if (!usedQuestionIds.has(question.id)) {
                selectedQuestions.push(question);
                usedQuestionIds.add(question.id);
                if (selectedQuestions.length >= this.QUESTIONS_PER_ROUND) break;
            }
        }
        
        if (logger) logger(`最終選択: ${selectedQuestions.map(q => q.id).join(', ')}`);
        return selectedQuestions;
    }
}

// グローバルインスタンス
const quizLogic = new QuizLogic();
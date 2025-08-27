// 統計計算エンジン（コア機能）
class StatisticsCalculator {
    // 統計計算（純粋関数）
    calculateStatistics(allQuizRecords, allQuestions) {
        const questionStats = {};
        
        // 各問題の統計を初期化
        allQuestions.forEach(q => {
            questionStats[q.id] = {
                questionId: q.id,
                question: q.question,
                attempts: 0,
                correct: 0,
                accuracy: 0,
                lastAttempt: null
            };
        });
        
        // 記録から統計を計算
        allQuizRecords.forEach(record => {
            if (questionStats[record.questionId]) {
                const stat = questionStats[record.questionId];
                stat.attempts++;
                if (record.isCorrect) {
                    stat.correct++;
                }
                stat.lastAttempt = record.timestamp;
            }
        });
        
        // 正答率計算
        Object.values(questionStats).forEach(stat => {
            if (stat.attempts > 0) {
                stat.accuracy = Math.round((stat.correct / stat.attempts) * 100);
            }
        });
        
        return {
            totalAttempts: allQuizRecords.length,
            totalSessions: new Set(allQuizRecords.map(r => r.sessionId)).size,
            questionStats: Object.values(questionStats)
        };
    }

    // 正答率に基づくCSSクラス
    getAccuracyClass(accuracy) {
        if (accuracy >= 80) return 'accuracy-high';
        if (accuracy >= 60) return 'accuracy-medium';
        return 'accuracy-low';
    }

    // 回答パターンSVG生成
    generateAnswerPattern(stat) {
        if (stat.attempts === 0) return '<span style="color: #999;">未挑戦</span>';
        
        const correct = stat.correct;
        const incorrect = stat.attempts - correct;
        const total = stat.attempts;
        
        const correctPercent = (correct / total) * 100;
        const incorrectPercent = (incorrect / total) * 100;
        
        return `
            <svg width="100" height="20" style="vertical-align: middle;">
                <rect x="0" y="5" width="${correctPercent}" height="10" fill="#28a745" rx="2"/>
                <rect x="${correctPercent}" y="5" width="${incorrectPercent}" height="10" fill="#dc3545" rx="2"/>
                <text x="50" y="15" text-anchor="middle" fill="black" font-size="10">${stat.accuracy}%</text>
            </svg>
        `;
    }

    // 出題パターンSVG生成
    generateQuestionPattern(questionId, allQuizRecords) {
        const questionRecords = allQuizRecords.filter(r => r.questionId === questionId);
        
        if (questionRecords.length === 0) {
            return '<span style="color: #999;">未出題</span>';
        }
        
        const sessions = {};
        questionRecords.forEach(record => {
            if (!sessions[record.sessionId]) {
                sessions[record.sessionId] = [];
            }
            sessions[record.sessionId].push(record);
        });
        
        const sessionCount = Object.keys(sessions).length;
        const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
        let svg = '<svg width="100" height="20" style="vertical-align: middle;">';
        
        const barWidth = Math.min(100 / sessionCount, 15);
        Object.keys(sessions).forEach((sessionId, index) => {
            const x = index * (100 / sessionCount);
            const height = Math.min(sessions[sessionId].length * 5, 15);
            const color = colors[index % colors.length];
            svg += `<rect x="${x}" y="${20 - height}" width="${barWidth - 1}" height="${height}" fill="${color}" rx="1"/>`;
        });
        
        svg += `<text x="50" y="10" text-anchor="middle" fill="white" font-size="8">${sessionCount}S</text>`;
        svg += '</svg>';
        
        return svg;
    }
}

// グローバルインスタンス  
const statisticsCalculator = new StatisticsCalculator();
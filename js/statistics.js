// 統計機能管理
class StatisticsManager {
    constructor() {
        this.currentSort = { field: 'questionId', order: 'asc' };
    }

    // 統計計算
    calculateStatistics() {
        const allQuizRecords = storageManager.loadQuizRecords();
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

    // 統計表示
    showStatistics() {
        const stats = this.calculateStatistics();
        uiManager.showScreen('statisticsContainer');
        this.displayStatistics(stats);
    }

    // 統計テーブル表示
    displayStatistics(stats) {
        const container = document.getElementById('statisticsContainer');
        if (!container) return;

        const sortedStats = [...stats.questionStats].sort((a, b) => {
            const field = this.currentSort.field;
            const order = this.currentSort.order;
            
            let aVal = a[field];
            let bVal = b[field];
            
            if (field === 'questionId') {
                aVal = parseInt(aVal.replace('Q', ''));
                bVal = parseInt(bVal.replace('Q', ''));
            }
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                <h2 style="margin: 0;">📊 学習統計</h2>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="uiManager.showMenu()" style="background: #6c757d;">🏠 メニューに戻る</button>
                    <button onclick="statisticsManager.exportStatistics()" style="background: #28a745;">📥 ダウンロード</button>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>全体統計:</strong> 
                総回答数: ${stats.totalAttempts}回 | 
                総セッション数: ${stats.totalSessions}回 | 
                全問題数: ${stats.questionStats.length}問
            </div>
            
            <div style="margin: 20px 0; text-align: center;">
                <strong>ソート:</strong>
                <button onclick="statisticsManager.sortStatistics('attempts')" style="margin: 0 5px; padding: 8px 15px;">挑戦回数順</button>
                <button onclick="statisticsManager.sortStatistics('correct')" style="margin: 0 5px; padding: 8px 15px;">正解数順</button>
                <button onclick="statisticsManager.sortStatistics('accuracy')" style="margin: 0 5px; padding: 8px 15px;">正答率順</button>
                <button onclick="statisticsManager.sortStatistics('questionId')" style="margin: 0 5px; padding: 8px 15px;">問題ID順</button>
            </div>
            
            <table class="statistics-table">
                <thead>
                    <tr>
                        <th>問題ID</th>
                        <th>問題内容</th>
                        <th>挑戦回数</th>
                        <th>正解数</th>
                        <th>正答率</th>
                        <th>回答パターン</th>
                        <th>出題パターン</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedStats.map(stat => `
                        <tr>
                            <td>${stat.questionId}</td>
                            <td style="max-width: 300px; word-wrap: break-word;">${stat.question}</td>
                            <td>${stat.attempts}</td>
                            <td>${stat.correct}</td>
                            <td><span class="${this.getAccuracyClass(stat.accuracy)}">${stat.accuracy}%</span></td>
                            <td>${this.generateAnswerPattern(stat)}</td>
                            <td>${this.generateQuestionPattern(stat.questionId)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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
    generateQuestionPattern(questionId) {
        const allQuizRecords = storageManager.loadQuizRecords();
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
        const avgPerSession = questionRecords.length / sessionCount;
        
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

    // パターン色取得
    getPatternColor(accuracy) {
        if (accuracy >= 80) return '#28a745';
        if (accuracy >= 60) return '#ffc107';
        return '#dc3545';
    }

    // 統計ソート
    sortStatistics(field) {
        if (this.currentSort.field === field) {
            this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.order = 'desc';
        }
        
        const stats = this.calculateStatistics();
        this.displayStatistics(stats);
    }

    // 統計エクスポート
    exportStatistics() {
        const stats = this.calculateStatistics();
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            ...stats
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-statistics-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// グローバルインスタンス
const statisticsManager = new StatisticsManager();
// クイズ機能管理
class QuizManager {
    constructor() {
        this.APP_VERSION = '0.34';
        this.QUESTIONS_PER_ROUND = 5;
        this.AUTO_NEXT_DELAY = 200; // 0.2秒
        
        this.quizData = [...allQuestions];
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizStartTime = null;
        this.sessionId = null;
        this.quizRecords = [];
        this.allQuizRecords = [];
        this.logs = [];
    }

    // セッションID生成
    generateSessionId() {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
        const random = Math.random().toString(36).substr(2, 5);
        return `${timestamp}-${random}`;
    }

    // ログ記録
    log(message) {
        const timestamp = new Date().toLocaleString('ja-JP');
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.push(logEntry);
        console.log(logEntry);
        
        const logOutput = document.getElementById('logOutput');
        if (logOutput) {
            logOutput.textContent += logEntry + '\n';
            logOutput.scrollTop = logOutput.scrollHeight;
        }
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

    // ランダム問題取得
    getRandomQuestions(count) {
        const shuffled = this.shuffleArray([...this.quizData]);
        return shuffled.slice(0, count);
    }

    // 段階的問題選択（1回目→2回目→3回目→適応学習）
    selectQuestionsWithAdaptiveLearning() {
        const totalAnswers = this.allQuizRecords.length;
        const totalQuestions = allQuestions.length; // 30問
        
        // 第1フェーズ: 全問題1回ずつ (0-29回答)
        if (totalAnswers < totalQuestions) {
            this.log(`第1フェーズ: 全問題1回目 (${totalAnswers}/${totalQuestions})`);
            return this.selectQuestionsForPhase(1);
        }
        
        // 第2フェーズ: 全問題2回ずつ (30-59回答) 
        if (totalAnswers < totalQuestions * 2) {
            this.log(`第2フェーズ: 全問題2回目 (${totalAnswers}/${totalQuestions * 2})`);
            return this.selectQuestionsForPhase(2);
        }
        
        // 第3フェーズ: 全問題3回ずつ (60-89回答)
        if (totalAnswers < totalQuestions * 3) {
            this.log(`第3フェーズ: 全問題3回目 (${totalAnswers}/${totalQuestions * 3})`);
            return this.selectQuestionsForPhase(3);
        }
        
        // 第4フェーズ以降: 適応学習開始 (90回答以降)
        this.log(`適応学習フェーズ: 正答率に応じた出題 (${totalAnswers}回答済み)`);
        return this.selectQuestionsBasedOnAccuracy();
    }

    // フェーズ別問題選択（指定回数に達していない問題を優先）
    selectQuestionsForPhase(targetCount) {
        const questionAppearanceCount = {};
        allQuestions.forEach(q => {
            questionAppearanceCount[q.id] = 0;
        });
        
        // 各問題の出現回数をカウント
        this.allQuizRecords.forEach(record => {
            if (questionAppearanceCount.hasOwnProperty(record.questionId)) {
                questionAppearanceCount[record.questionId]++;
            }
        });
        
        // 🚨 デバッグ情報表示
        this.log(`=== フェーズ${targetCount} デバッグ ===`);
        this.log(`総回答数: ${this.allQuizRecords.length}`);
        const counts = Object.entries(questionAppearanceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        this.log(`出現回数TOP5: ${counts.map(([id, count]) => `${id}:${count}`).join(', ')}`);
        
        // まだtargetCount回に達していない問題を抽出（厳格チェック）
        const availableQuestions = allQuestions.filter(q => {
            const count = questionAppearanceCount[q.id];
            const isAvailable = count < targetCount;
            if (!isAvailable) {
                this.log(`⛔ ${q.id} は${count}回出題済みのためスキップ`);
            }
            return isAvailable;
        });
        
        this.log(`フェーズ${targetCount}: 選択可能問題 ${availableQuestions.length}問`);
        this.log(`選択可能: ${availableQuestions.map(q => q.id).join(', ')}`);
        
        if (availableQuestions.length === 0) {
            this.log('🚨 エラー: 選択可能問題がありません！');
            // フォールバック：回数が最も少ない問題を選択
            const minCount = Math.min(...Object.values(questionAppearanceCount));
            const fallbackQuestions = allQuestions.filter(q => 
                questionAppearanceCount[q.id] === minCount
            );
            this.log(`フォールバック: 最少回数(${minCount}回)問題から選択`);
            return this.shuffleArray(fallbackQuestions).slice(0, this.QUESTIONS_PER_ROUND);
        }
        
        // 選択可能問題からランダムに5問選択
        const shuffled = this.shuffleArray(availableQuestions);
        const selected = shuffled.slice(0, Math.min(this.QUESTIONS_PER_ROUND, shuffled.length));
        
        this.log(`✅ 選択された問題: ${selected.map(q => `${q.id}(${questionAppearanceCount[q.id]}回)`).join(', ')}`);
        
        return selected;
    }

    // バランス出現保証問題選択（旧関数・使用停止予定）
    selectQuestionsBalanced(currentSession) {
        const questionAppearanceCount = {};
        allQuestions.forEach(q => {
            questionAppearanceCount[q.id] = 0;
        });
        
        this.allQuizRecords.forEach(record => {
            if (questionAppearanceCount.hasOwnProperty(record.questionId)) {
                questionAppearanceCount[record.questionId]++;
            }
        });
        
        const appearanceGroups = { 0: [], 1: [], 2: [], 3: [] };
        
        allQuestions.forEach(q => {
            const count = questionAppearanceCount[q.id];
            const groupKey = Math.min(count, 3);
            appearanceGroups[groupKey].push(q);
        });
        
        this.log(`バランス出現モード (セッション${currentSession}/3):`);
        this.log(`  0回出現: ${appearanceGroups[0].length}問`);
        this.log(`  1回出現: ${appearanceGroups[1].length}問`);
        this.log(`  2回出現: ${appearanceGroups[2].length}問`);
        this.log(`  3回以上: ${appearanceGroups[3].length}問`);
        
        const selectedQuestions = [];
        
        for (let priority = 0; priority <= 2; priority++) {
            const availableQuestions = appearanceGroups[priority];
            if (availableQuestions.length === 0) continue;
            
            const shuffled = this.shuffleArray(availableQuestions);
            const needed = this.QUESTIONS_PER_ROUND - selectedQuestions.length;
            const toAdd = Math.min(needed, shuffled.length);
            
            selectedQuestions.push(...shuffled.slice(0, toAdd));
            
            if (selectedQuestions.length >= this.QUESTIONS_PER_ROUND) break;
        }
        
        if (selectedQuestions.length < this.QUESTIONS_PER_ROUND) {
            const shuffled = this.shuffleArray(appearanceGroups[3]);
            const needed = this.QUESTIONS_PER_ROUND - selectedQuestions.length;
            selectedQuestions.push(...shuffled.slice(0, needed));
        }
        
        this.log(`選択された問題: ${selectedQuestions.map(q => `${q.id}(${questionAppearanceCount[q.id]}回)`).join(', ')}`);
        
        return this.shuffleArray(selectedQuestions);
    }

    // 正解率ベース問題選択
    selectQuestionsBasedOnAccuracy() {
        const stats = statisticsManager.calculateStatistics();
        const questionPool = [];
        
        allQuestions.forEach(question => {
            const questionStat = stats.questionStats.find(s => s.questionId === question.id);
            let weight;
            
            if (!questionStat || questionStat.attempts === 0) {
                weight = 5;
                this.log(`${question.id}: 未挑戦 - 出題重み${weight}`);
            } else {
                const accuracy = questionStat.accuracy;
                if (accuracy < 50) {
                    weight = 4;
                    this.log(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
                } else if (accuracy < 80) {
                    weight = 2;
                    this.log(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
                } else {
                    weight = 1;
                    this.log(`${question.id}: 正解率${accuracy}% - 出題重み${weight}`);
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
        
        this.log(`最終選択: ${selectedQuestions.map(q => q.id).join(', ')}`);
        return selectedQuestions;
    }

    // クイズ開始
    startQuiz() {
        this.quizStartTime = new Date();
        this.sessionId = this.generateSessionId();
        this.log('クイズ開始');
        this.log(`セッションID: ${this.sessionId}`);
        this.log(`1回の問題数: ${this.QUESTIONS_PER_ROUND}問`);
        
        this.allQuizRecords = storageManager.loadQuizRecords();
        this.questions = this.selectQuestionsWithAdaptiveLearning();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizRecords = [];
        
        uiManager.showScreen('quizContainer');
        document.getElementById('totalQuestions').textContent = this.QUESTIONS_PER_ROUND;
        
        this.showQuestion();
    }

    // 問題表示
    showQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('correctCount').textContent = this.score;
        document.getElementById('questionText').textContent = question.question;
        
        const progressPercent = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.getElementById('progressBar').style.width = progressPercent + '%';
        
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option';
            button.textContent = option;
            button.onclick = () => this.selectAnswer(index);
            optionsContainer.appendChild(button);
        });
        
        document.getElementById('autoNextInfo').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
    }

    // 答え選択
    selectAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correct;
        const answerTime = new Date();
        const timeTaken = answerTime - this.quizStartTime;
        
        const options = document.querySelectorAll('.option');
        options.forEach((option, index) => {
            option.disabled = true;
            if (index === question.correct) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            this.score++;
        }
        
        this.quizRecords.push({
            sessionId: this.sessionId,
            questionId: question.id,
            question: question.question,
            selectedAnswer: question.options[selectedIndex],
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect,
            timeTaken: timeTaken,
            timestamp: answerTime.toISOString()
        });
        
        this.log(`問題${this.currentQuestionIndex + 1}: ${isCorrect ? '正解' : '不正解'} (${question.id})`);
        
        document.getElementById('autoNextInfo').style.display = 'block';
        
        setTimeout(() => {
            this.nextQuestion();
        }, this.AUTO_NEXT_DELAY);
    }

    // 次の問題
    nextQuestion() {
        this.currentQuestionIndex++;
        this.showQuestion();
    }

    // 結果表示
    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const quizEndTime = new Date();
        const totalTime = Math.round((quizEndTime - this.quizStartTime) / 1000);
        
        this.log(`クイズ終了: ${this.score}/${this.questions.length}問正解 (${percentage}%)`);
        this.log(`所要時間: ${totalTime}秒`);
        
        this.allQuizRecords.push(...this.quizRecords);
        storageManager.saveQuizRecords(this.allQuizRecords);
        
        uiManager.showScreen('scoreContainer');
        document.getElementById('finalScore').textContent = `${this.score} / ${this.questions.length}`;
        document.getElementById('percentage').textContent = `${percentage}%`;
        document.getElementById('timeTaken').textContent = `${totalTime}秒`;
        
        this.updateVersion();
    }

    // バージョン更新
    updateVersion() {
        const versionDisplay = document.getElementById('versionDisplay');
        if (versionDisplay) {
            versionDisplay.textContent = `v${this.APP_VERSION}`;
        }
    }

    // ログエクスポート
    exportLog() {
        storageManager.exportData();
    }

    // デフォルトリセット
    resetToDefault() {
        this.quizData = [...allQuestions];
        this.log('クイズデータをデフォルトに戻しました');
        alert('クイズデータをデフォルトに戻しました');
    }

    // クイズデータ読み込み
    loadQuizData() {
        const fileInput = document.getElementById('quizFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('ファイルを選択してください');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let newData;
                const content = e.target.result;
                
                if (file.name.endsWith('.json')) {
                    newData = JSON.parse(content);
                } else {
                    newData = this.parseTextQuizData(content);
                }
                
                if (this.validateQuizData(newData)) {
                    this.quizData = newData;
                    this.log(`新しいクイズデータを読み込みました (${newData.length}問)`);
                    alert(`クイズデータを読み込みました (${newData.length}問)`);
                } else {
                    throw new Error('データ形式が正しくありません');
                }
            } catch (error) {
                this.log(`クイズデータの読み込みに失敗: ${error.message}`);
                alert(`エラー: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }

    // テキスト形式パース
    parseTextQuizData(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const questions = [];
        
        for (let i = 0; i < lines.length; i += 6) {
            if (i + 5 >= lines.length) break;
            
            const question = {
                id: `Q${String(questions.length + 1).padStart(3, '0')}`,
                question: lines[i].trim(),
                options: [
                    lines[i + 1].trim(),
                    lines[i + 2].trim(),
                    lines[i + 3].trim(),
                    lines[i + 4].trim()
                ],
                correct: parseInt(lines[i + 5].trim()) - 1
            };
            
            questions.push(question);
        }
        
        return questions;
    }

    // データ検証
    validateQuizData(data) {
        if (!Array.isArray(data)) return false;
        
        return data.every(item => 
            item.id && 
            item.question && 
            Array.isArray(item.options) && 
            item.options.length === 4 && 
            typeof item.correct === 'number' && 
            item.correct >= 0 && 
            item.correct < 4
        );
    }
}

// グローバルインスタンス
const quizManager = new QuizManager();
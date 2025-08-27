// シミュレーションデータ生成（チームA担当）
class DataGenerator {
    constructor() {
        this.questionTemplates = [
            'JavaScriptで{topic}について正しいのは？',
            'HTML5の{topic}要素の特徴は？',
            'CSSで{topic}を実現する方法は？',
            'Reactの{topic}について正しいのは？',
            'Node.jsで{topic}を使う目的は？'
        ];
        
        this.topics = [
            '変数宣言', '関数定義', 'オブジェクト', '配列', 'ループ',
            '条件分岐', 'イベント', 'DOM操作', 'Ajax', 'Promise',
            'async/await', 'クラス', 'モジュール', 'スコープ', 'クロージャ'
        ];
        
        this.options = [
            ['varを使う', 'letを使う', 'constを使う', 'どちらでも良い'],
            ['グローバル関数', '無名関数', 'アロー関数', 'コンストラクタ'],
            ['正しい', '部分的に正しい', '間違い', '状況次第']
        ];
    }
    
    // ランダム問題生成
    generateRandomQuestions(count = 100) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            const questionId = `SIM${String(i + 1).padStart(3, '0')}`;
            const topic = this.topics[Math.floor(Math.random() * this.topics.length)];
            const template = this.questionTemplates[Math.floor(Math.random() * this.questionTemplates.length)];
            const question = template.replace('{topic}', topic);
            
            // オプションをランダム選択
            const optionSet = this.options[Math.floor(Math.random() * this.options.length)];
            const shuffledOptions = this.shuffleArray([...optionSet]);
            const correctIndex = Math.floor(Math.random() * 4);
            
            questions.push({
                id: questionId,
                question: question,
                options: shuffledOptions,
                correct: correctIndex
            });
        }
        
        return questions;
    }
    
    // シミュレーション用テストデータ生成
    generateTestRecords(questions, sessionCount = 10, accuracy = 0.7) {
        const records = [];
        
        for (let session = 1; session <= sessionCount; session++) {
            const sessionId = `TEST-SESSION-${String(session).padStart(3, '0')}`;
            const sessionDate = new Date(Date.now() - (sessionCount - session) * 24 * 60 * 60 * 1000);
            
            // 各セッションで一部の問題を出題
            const selectedQuestions = this.shuffleArray(questions).slice(0, 5);
            
            selectedQuestions.forEach((question, index) => {
                const isCorrect = Math.random() < accuracy;
                const timeTaken = Math.floor(Math.random() * 30000) + 5000; // 5-35秒
                
                records.push({
                    sessionId: sessionId,
                    questionId: question.id,
                    question: question.question,
                    selectedAnswer: question.options[isCorrect ? question.correct : (question.correct + 1) % 4],
                    correctAnswer: question.options[question.correct],
                    isCorrect: isCorrect,
                    timeTaken: timeTaken,
                    timestamp: new Date(sessionDate.getTime() + index * 60000).toISOString()
                });
            });
        }
        
        return records;
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
}

// グローバルインスタンス
const dataGenerator = new DataGenerator();
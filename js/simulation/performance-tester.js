// パフォーマンステスト（チームA担当）
class PerformanceTester {
    constructor() {
        this.testResults = [];
    }
    
    // クイズロジックのパフォーマンステスト
    async testQuizLogicPerformance(questionCount = 1000, recordCount = 10000) {
        console.log(`=== パフォーマンステスト開始 ===`);
        console.log(`問題数: ${questionCount}問, 記録数: ${recordCount}件`);
        
        // テストデータ生成
        const testQuestions = dataGenerator.generateRandomQuestions(questionCount);
        const testRecords = dataGenerator.generateTestRecords(testQuestions, Math.floor(recordCount / 5), 0.7);
        
        console.log(`テストデータ生成完了: ${testRecords.length}件`);
        
        // 各フェーズのパフォーマンステスト
        const results = {
            phase1: await this.testPhasePerformance(1, testQuestions, testRecords.slice(0, Math.floor(testRecords.length * 0.3))),
            phase2: await this.testPhasePerformance(2, testQuestions, testRecords.slice(0, Math.floor(testRecords.length * 0.6))),
            phase3: await this.testPhasePerformance(3, testQuestions, testRecords.slice(0, Math.floor(testRecords.length * 0.9))),
            adaptive: await this.testAdaptiveLearningPerformance(testQuestions, testRecords)
        };
        
        this.displayResults(results);
        return results;
    }
    
    // フェーズ別パフォーマンステスト
    async testPhasePerformance(phase, questions, records) {
        const startTime = performance.now();
        
        // 100回テスト実行
        const iterations = 100;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const iterationStart = performance.now();
            const selectedQuestions = quizLogic.selectQuestionsForPhase(phase, records, questions);
            const iterationEnd = performance.now();
            
            results.push({
                iteration: i + 1,
                duration: iterationEnd - iterationStart,
                questionCount: selectedQuestions.length,
                questions: selectedQuestions.map(q => q.id)
            });
        }
        
        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        
        return {
            phase: `フェーズ${phase}`,
            totalDuration: Math.round(totalDuration),
            avgDuration: Math.round(avgDuration * 100) / 100,
            iterations,
            minDuration: Math.min(...results.map(r => r.duration)),
            maxDuration: Math.max(...results.map(r => r.duration)),
            results
        };
    }
    
    // 適応学習パフォーマンステスト
    async testAdaptiveLearningPerformance(questions, records) {
        const startTime = performance.now();
        
        const iterations = 100;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const iterationStart = performance.now();
            const selectedQuestions = quizLogic.selectQuestionsBasedOnAccuracy(records, questions);
            const iterationEnd = performance.now();
            
            results.push({
                iteration: i + 1,
                duration: iterationEnd - iterationStart,
                questionCount: selectedQuestions.length,
                questions: selectedQuestions.map(q => q.id)
            });
        }
        
        const endTime = performance.now();
        const totalDuration = endTime - startTime;
        const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
        
        return {
            phase: '適応学習',
            totalDuration: Math.round(totalDuration),
            avgDuration: Math.round(avgDuration * 100) / 100,
            iterations,
            minDuration: Math.min(...results.map(r => r.duration)),
            maxDuration: Math.max(...results.map(r => r.duration)),
            results
        };
    }
    
    // 結果表示
    displayResults(results) {
        console.log('\n=== パフォーマンステスト結果 ===');
        
        Object.values(results).forEach(result => {
            console.log(`\n▼ ${result.phase}`);
            console.log(`  平均実行時間: ${result.avgDuration}ms`);
            console.log(`  最小実行時間: ${Math.round(result.minDuration * 100) / 100}ms`);
            console.log(`  最大実行時間: ${Math.round(result.maxDuration * 100) / 100}ms`);
            console.log(`  総実行時間: ${result.totalDuration}ms (${result.iterations}回)`);
        });
        
        // 結果をグローバルに保存
        this.testResults.push({
            timestamp: new Date().toISOString(),
            results
        });
    }
    
    // ストレステスト
    async runStressTest(maxQuestions = 10000, maxRecords = 100000) {
        console.log('=== ストレステスト開始 ===');
        
        const testSizes = [100, 500, 1000, 5000, maxQuestions];
        const recordSizes = [1000, 5000, 10000, 50000, maxRecords];
        
        for (const questionCount of testSizes) {
            for (const recordCount of recordSizes) {
                if (recordCount <= questionCount * 50) { // 現実的なバランス
                    console.log(`テスト: ${questionCount}問, ${recordCount}件`);
                    
                    try {
                        const startTime = performance.now();
                        await this.testQuizLogicPerformance(questionCount, recordCount);
                        const endTime = performance.now();
                        
                        console.log(`完了: ${Math.round(endTime - startTime)}ms\n`);
                    } catch (error) {
                        console.error(`エラー: ${questionCount}問/${recordCount}件`, error);
                        break;
                    }
                }
            }
        }
    }
    
    // 結果エクスポート
    exportResults() {
        const data = JSON.stringify(this.testResults, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-test-results-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// グローバルインスタンス
const performanceTester = new PerformanceTester();
// データ保存・読み込み機能
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'allQuizRecords'; // 旧バージョンと同じキーを使用して継続性確保
    }

    // クイズ記録の読み込み
    loadQuizRecords() {
        try {
            // 新形式のデータを確認
            const newData = localStorage.getItem(this.STORAGE_KEY);
            if (newData) {
                const parsed = JSON.parse(newData);
                return Array.isArray(parsed) ? parsed : [];
            }
            
            // 旧形式のデータキーを試す（最新の0.27は'allQuizRecords'を使用）
            const oldKeys = ['allQuizRecords', 'quizAppData', 'quizRecords'];
            for (const oldKey of oldKeys) {
                const oldData = localStorage.getItem(oldKey);
                if (oldData) {
                    try {
                        const parsed = JSON.parse(oldData);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            console.log(`旧データを発見しました (${oldKey}): ${parsed.length}件`);
                            // 新形式に移行保存
                            this.saveQuizRecords(parsed);
                            console.log('データ移行完了');
                            return parsed;
                        }
                    } catch (e) {
                        console.warn(`旧データ ${oldKey} の解析に失敗:`, e);
                    }
                }
            }
            
            return [];
        } catch (error) {
            console.error('クイズ記録の読み込みに失敗:', error);
            return [];
        }
    }

    // クイズ記録の保存
    saveQuizRecords(records) {
        try {
            const dataToSave = JSON.stringify(records, null, 2);
            localStorage.setItem(this.STORAGE_KEY, dataToSave);
            return true;
        } catch (error) {
            console.error('クイズ記録の保存に失敗:', error);
            if (error.name === 'QuotaExceededError') {
                alert('ストレージ容量が不足しています。データの一部が保存できませんでした。');
            }
            return false;
        }
    }

    // ブラウザ情報の取得
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            timestamp: new Date().toISOString()
        };
    }

    // テストモード: データバックアップとリセット
    switchToTestMode() {
        const currentRecords = this.loadQuizRecords();
        const currentDate = new Date().toISOString().slice(0, 10);
        
        // クイズ記録のバックアップ
        const backupKey = `BACKUP_quizRecords_${currentDate}`;
        localStorage.setItem(backupKey, JSON.stringify(currentRecords));
        
        // 問題データのバックアップ（allQuestionsを保存）
        const backupQuestionsKey = 'BACKUP_questions_30problems';
        localStorage.setItem(backupQuestionsKey, JSON.stringify(allQuestions));
        
        // 統計データをリセット
        this.saveQuizRecords([]);
        
        console.log(`✅ テストモード開始:`);
        console.log(`  - クイズ記録バックアップ: ${backupKey} (${currentRecords.length}件)`);
        console.log(`  - 問題データバックアップ: ${backupQuestionsKey} (${allQuestions.length}問)`);
        console.log(`  - 統計データリセット完了`);
        
        return {
            backupKey,
            backupQuestionsKey,
            recordCount: currentRecords.length,
            questionCount: allQuestions.length
        };
    }

    // 本番データに復旧
    restoreFromTestMode() {
        const currentDate = new Date().toISOString().slice(0, 10);
        const backupKey = `BACKUP_quizRecords_${currentDate}`;
        
        try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
                const records = JSON.parse(backupData);
                this.saveQuizRecords(records);
                console.log(`✅ 本番データ復旧完了: ${records.length}件`);
                return { success: true, recordCount: records.length };
            } else {
                console.warn(`⚠️ バックアップデータが見つかりません: ${backupKey}`);
                return { success: false, error: 'バックアップが見つかりません' };
            }
        } catch (error) {
            console.error('復旧エラー:', error);
            return { success: false, error: error.message };
        }
    }

    // バックアップ一覧取得
    getBackupList() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('BACKUP_')) {
                try {
                    const data = localStorage.getItem(key);
                    const parsedData = JSON.parse(data);
                    backups.push({
                        key: key,
                        type: key.includes('questions') ? '問題データ' : 'クイズ記録',
                        count: Array.isArray(parsedData) ? parsedData.length : '不明',
                        size: data.length
                    });
                } catch (e) {
                    // 無効なデータはスキップ
                }
            }
        }
        return backups;
    }

    // データエクスポート
    exportData() {
        const allQuizRecords = this.loadQuizRecords();
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            totalRecords: allQuizRecords.length,
            browserInfo: this.getBrowserInfo(),
            records: allQuizRecords
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// グローバルインスタンス
const storageManager = new StorageManager();
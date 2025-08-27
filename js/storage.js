// データ保存・読み込み機能
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'quizAppData_v1';
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
            
            // 旧形式のデータキーを試す
            const oldKeys = ['quizAppData', 'quizRecords', 'allQuizRecords'];
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
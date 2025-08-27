// アプリケーション初期化（チームB担当）

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM読み込み完了');
    
    // バージョン表示更新
    quizManager.updateVersion();
    
    // 初期化テスト実行
    uiManager.runInitializationTest();
    
    // メニュー画面表示
    uiManager.showMenu();
    
    console.log('アプリケーション初期化完了');
});

// グローバル関数（HTMLから呼ばれる関数）
function startQuiz() {
    quizManager.startQuiz();
}

function showStatistics() {
    statisticsManager.showStatistics();
}

function exportLog() {
    quizManager.exportLog();
}

function showMenu() {
    uiManager.showMenu();
}

function nextQuestion() {
    quizManager.nextQuestion();
}

function toggleQuizDataMenu() {
    uiManager.toggleQuizDataMenu();
}

function loadQuizData() {
    quizManager.loadQuizData();
}

function resetToDefault() {
    quizManager.resetToDefault();
}

function switchToTestMode() {
    const result = storageManager.switchToTestMode();
    alert(`テストモード開始！\n- バックアップ: ${result.recordCount}件のクイズ記録\n- 問題数: 30問→10問\n- 統計リセット完了\n\nページをリフレッシュしてください`);
    location.reload();
}

function restoreFromTestMode() {
    if (confirm('本番データに戻しますか？\n現在のテストデータは削除されます。')) {
        const result = storageManager.restoreFromTestMode();
        if (result.success) {
            alert(`本番データに復旧完了！\n復旧件数: ${result.recordCount}件\n\nページをリフレッシュしてください`);
            location.reload();
        } else {
            alert(`復旧に失敗しました: ${result.error}`);
        }
    }
}

function showBackupList() {
    const backups = storageManager.getBackupList();
    if (backups.length === 0) {
        alert('バックアップデータがありません');
        return;
    }
    
    let message = '📋 バックアップ一覧:\n\n';
    backups.forEach(backup => {
        message += `${backup.type}: ${backup.count}件 (${backup.key})\n`;
    });
    
    alert(message);
}
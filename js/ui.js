// UI管理機能
class UIManager {
    constructor() {
        this.currentScreen = 'menuScreen';
    }

    // 画面切り替え
    showScreen(screenId) {
        // 全ての画面を非表示
        const screens = ['menuScreen', 'quizContainer', 'scoreContainer', 'statisticsContainer'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('active');
                element.style.display = 'none';
            }
        });

        // 指定された画面を表示
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'block';
            this.currentScreen = screenId;
        }
    }

    // メニュー画面表示
    showMenu() {
        this.showScreen('menuScreen');
    }

    // クイズデータメニュー切り替え
    toggleQuizDataMenu() {
        const menu = document.getElementById('quizDataMenu');
        const icon = document.getElementById('toggleIcon');
        
        if (menu.style.display === 'none') {
            menu.style.display = 'block';
            icon.textContent = '▲';
        } else {
            menu.style.display = 'none';
            icon.textContent = '▼';
        }
    }

    // 初期化テスト実行
    runInitializationTest() {
        console.log('=== 初期化テスト実行 ===');
        
        // DOM要素の存在確認
        const requiredElements = [
            'versionDisplay', 'menuScreen', 'quizContainer', 'scoreContainer',
            'currentQuestion', 'totalQuestions', 'correctCount', 'progressBar',
            'questionText', 'optionsContainer', 'autoNextInfo', 'nextBtn'
        ];
        
        const missingElements = [];
        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('❌ 以下のDOM要素が見つかりません:', missingElements);
            return false;
        }
        
        // 問題データの確認
        if (!allQuestions || allQuestions.length === 0) {
            console.error('❌ 問題データが読み込まれていません');
            return false;
        }
        
        // ストレージの確認
        try {
            const testData = storageManager.loadQuizRecords();
            console.log(`✅ ストレージ正常 (記録数: ${testData.length})`);
        } catch (error) {
            console.error('❌ ストレージエラー:', error);
            return false;
        }
        
        console.log('✅ 初期化テスト完了');
        return true;
    }
}

// グローバルインスタンス
const uiManager = new UIManager();

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
#!/usr/bin/env node
// デザイン変更検出ツール

const fs = require('fs');
const crypto = require('crypto');

// 保護対象ファイルとそのハッシュ値
const protectedFiles = {
    'css/styles.css': null, // 初回実行時に設定
    'js/statistics.js': null,
    'index.html': null
};

// 重要な設定値
const criticalConfigs = {
    localStorage_key: 'allQuizRecords',
    button_positions: {
        statistics_menu_button: 'top-right',
        statistics_download_button: 'top-right'
    }
};

function calculateHash(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  ファイルが見つかりません: ${filePath}`);
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

function checkDesignChanges() {
    console.log('🔍 デザイン変更検出を開始...\n');
    
    let hasChanges = false;
    
    // ファイルハッシュチェック
    for (const [filePath, expectedHash] of Object.entries(protectedFiles)) {
        const currentHash = calculateHash(filePath);
        
        if (expectedHash && currentHash !== expectedHash) {
            console.log(`❌ 変更検出: ${filePath}`);
            console.log(`   期待値: ${expectedHash.substring(0, 16)}...`);
            console.log(`   現在値: ${currentHash.substring(0, 16)}...`);
            hasChanges = true;
        }
    }
    
    // 重要設定値チェック
    if (fs.existsSync('js/storage.js')) {
        const storageContent = fs.readFileSync('js/storage.js', 'utf8');
        if (!storageContent.includes("'allQuizRecords'")) {
            console.log('❌ 重大な変更検出: LocalStorageキーが変更されています！');
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        console.log('\n🚨 デザイン変更が検出されました！');
        console.log('DESIGN_LOCK.md を確認し、変更が許可されているか確認してください。');
        process.exit(1);
    } else {
        console.log('✅ デザイン変更なし：全ての保護対象が維持されています');
    }
}

function updateBaseline() {
    console.log('📝 ベースライン更新中...');
    
    for (const filePath of Object.keys(protectedFiles)) {
        const hash = calculateHash(filePath);
        if (hash) {
            protectedFiles[filePath] = hash;
            console.log(`✅ ${filePath}: ${hash.substring(0, 16)}...`);
        }
    }
    
    // ハッシュ値をファイルに保存
    fs.writeFileSync('.design-hashes.json', JSON.stringify(protectedFiles, null, 2));
    console.log('💾 ベースライン保存完了');
}

function loadBaseline() {
    if (fs.existsSync('.design-hashes.json')) {
        const saved = JSON.parse(fs.readFileSync('.design-hashes.json', 'utf8'));
        Object.assign(protectedFiles, saved);
    }
}

// コマンドライン引数処理
const args = process.argv.slice(2);

if (args.includes('--update')) {
    updateBaseline();
} else {
    loadBaseline();
    checkDesignChanges();
}
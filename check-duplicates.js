#!/usr/bin/env node
// JavaScript関数定義・使用チェッカー（完全版）

const fs = require('fs');
const path = require('path');

function checkFunctions(filePath) {
    console.log(`🔍 JavaScript関数チェック開始: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 1. function宣言を検出
    const functionRegex = /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
    const definedFunctions = new Map(); // 関数名 -> [行番号のリスト]
    
    lines.forEach((line, index) => {
        const match = line.match(functionRegex);
        if (match) {
            const funcName = match[1];
            if (!definedFunctions.has(funcName)) {
                definedFunctions.set(funcName, []);
            }
            definedFunctions.get(funcName).push(index + 1);
        }
    });
    
    // 2. 関数呼び出しを検出
    const callRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    const calledFunctions = new Map(); // 関数名 -> [行番号のリスト]
    const builtinFunctions = new Set([
        // JavaScript組み込み関数・オブジェクト
        'console', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'isNaN', 
        'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'log', 'error', 'warn',
        'Math', 'Date', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean',
        'Error', 'Set', 'Map', 'Blob', 'URL', 'FileReader', 'Storage',
        // DOM関数・プロパティ
        'getElementById', 'querySelector', 'querySelectorAll', 'addEventListener', 'createElement',
        'document', 'window', 'localStorage', 'location', 'navigator',
        // Array/Objectメソッド
        'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'forEach', 'map', 'filter',
        'sort', 'find', 'includes', 'indexOf', 'join', 'split', 'trim', 'replace',
        'every', 'some', 'reduce', 'concat', 'reverse', 'toString', 'valueOf',
        'hasOwnProperty', 'keys', 'values', 'entries', 'has', 'localeCompare',
        // Math関数
        'floor', 'ceil', 'round', 'random', 'abs', 'max', 'min', 'sqrt',
        // Date関数
        'getTime', 'toISOString', 'toLocaleDateString', 'toLocaleTimeString', 'toLocaleString',
        // JSON関数
        'parse', 'stringify',
        // Storage関数
        'getItem', 'setItem', 'removeItem', 'clear',
        // DOM操作
        'add', 'remove', 'contains', 'toggle', 'click', 'appendChild', 'removeChild',
        // ファイル関数
        'readAsText', 'endsWith', 'startsWith',
        // CSS関数（疑似関数として検出される）
        'linear', 'gradient', 'rgba', 'rgb', 'calc', 'translateY', 'translateX', 'rotate',
        'child', 'hover', 'active', 'focus',
        // その他の組み込み
        'isArray', 'toFixed', 'substr', 'substring', 'charAt', 'charCodeAt',
        'createObjectURL', 'fromCharCode',
        // 予約語・キーワード
        'if', 'for', 'while', 'switch', 'try', 'catch', 'function', 'return', 'new',
        'var', 'let', 'const', 'class', 'extends', 'import', 'export',
        // メディアクエリ
        'and', 'or', 'not', 'screen', 'print',
        // プロトタイプメソッド（一般的なもの）
        'apply', 'call', 'bind', 'length', 'name', 'constructor'
    ]);
    
    lines.forEach((line, index) => {
        // 文字列内や配列内の関数名を除外（クイズ選択肢など）
        if (line.includes('options:') || line.includes('"') || line.includes("'")) {
            return; // スキップ
        }
        
        let match;
        while ((match = callRegex.exec(line)) !== null) {
            const funcName = match[1];
            // 組み込み関数やキーワードを除外
            if (!builtinFunctions.has(funcName) && !funcName.match(/^(var|let|const|return|new)$/)) {
                if (!calledFunctions.has(funcName)) {
                    calledFunctions.set(funcName, []);
                }
                calledFunctions.get(funcName).push(index + 1);
            }
        }
    });
    
    // 3. 重複定義チェック
    let hasDuplicates = false;
    console.log(`\n📊 検出された関数定義: ${definedFunctions.size}個`);
    
    definedFunctions.forEach((lineNumbers, funcName) => {
        if (lineNumbers.length > 1) {
            console.log(`❌ 重複定義: ${funcName}`);
            lineNumbers.forEach(lineNum => {
                console.log(`   - 行${lineNum}: ${lines[lineNum - 1].trim()}`);
            });
            hasDuplicates = true;
        } else {
            console.log(`✅ ${funcName} (行${lineNumbers[0]})`);
        }
    });
    
    // 4. 未定義関数使用チェック
    let hasUndefinedCalls = false;
    console.log(`\n🔍 未定義関数使用チェック:`);
    
    calledFunctions.forEach((lineNumbers, funcName) => {
        if (!definedFunctions.has(funcName)) {
            console.log(`⚠️  未定義関数: ${funcName}`);
            lineNumbers.slice(0, 5).forEach(lineNum => { // 最大5行まで表示
                console.log(`   - 行${lineNum}: ${lines[lineNum - 1].trim()}`);
            });
            if (lineNumbers.length > 5) {
                console.log(`   - ... 他${lineNumbers.length - 5}箇所`);
            }
            hasUndefinedCalls = true;
        }
    });
    
    if (!hasUndefinedCalls) {
        console.log(`✨ 未定義関数なし：すべての関数呼び出しが定義済みです！`);
    }
    
    // 5. 統計表示
    console.log(`\n📈 統計:`);
    console.log(`  - 定義された関数: ${definedFunctions.size}個`);
    console.log(`  - 呼び出されている関数: ${calledFunctions.size}個`);
    console.log(`  - 未使用の関数: ${Array.from(definedFunctions.keys()).filter(f => !calledFunctions.has(f)).length}個`);
    
    // 6. 終了判定
    if (hasDuplicates || hasUndefinedCalls) {
        console.log(`\n🚨 問題が見つかりました！修正が必要です。`);
        process.exit(1);
    } else {
        console.log(`\n✨ 全チェック通過：関数定義と使用に問題なし！`);
    }
}

// 実行
if (process.argv.length < 3) {
    console.log('使用方法: node check-duplicates.js <ファイルパス>');
    process.exit(1);
}

const filePath = process.argv[2];
if (!fs.existsSync(filePath)) {
    console.log(`❌ ファイルが見つかりません: ${filePath}`);
    process.exit(1);
}

checkFunctions(filePath);
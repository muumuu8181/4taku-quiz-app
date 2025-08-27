#!/usr/bin/env node
// JavaScript関数重複定義チェッカー

const fs = require('fs');
const path = require('path');

function checkDuplicateFunctions(filePath) {
    console.log(`🔍 関数重複チェック開始: ${filePath}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // function宣言を検出
    const functionRegex = /^\s*function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/;
    const functions = new Map(); // 関数名 -> [行番号のリスト]
    
    lines.forEach((line, index) => {
        const match = line.match(functionRegex);
        if (match) {
            const funcName = match[1];
            if (!functions.has(funcName)) {
                functions.set(funcName, []);
            }
            functions.get(funcName).push(index + 1);
        }
    });
    
    // 結果表示
    let hasDuplicates = false;
    console.log(`\n📊 検出された関数: ${functions.size}個`);
    
    functions.forEach((lineNumbers, funcName) => {
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
    
    if (hasDuplicates) {
        console.log(`\n🚨 重複定義が見つかりました！修正が必要です。`);
        process.exit(1);
    } else {
        console.log(`\n✨ 重複定義なし：すべての関数が一意です！`);
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

checkDuplicateFunctions(filePath);
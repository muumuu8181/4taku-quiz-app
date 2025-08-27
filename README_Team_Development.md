# 3チーム開発構造 - チーム分担ガイド

## 📁 ディレクトリ構造

```
js/
├── core/                    # チームC（コア機能）
│   ├── quiz-logic.js        # クイズ選択アルゴリズム
│   └── statistics-calculator.js # 統計計算エンジン
├── simulation/              # チームA（シミュレーション）
│   ├── data-generator.js    # テストデータ生成
│   └── performance-tester.js # パフォーマンス測定
├── ui/                     # チームB（UI機能）
│   ├── ui-manager.js       # 画面管理・表示制御
│   └── app-initialization.js # 初期化・イベント処理
├── storage.js              # 共通（データ保存）
├── statistics.js           # 共通（統計表示）
└── quiz.js                 # メイン（全体制御）
```

## 🎯 チーム分担詳細

### チームA: シミュレーション機能
**担当ファイル**: `js/simulation/`

- **data-generator.js**: 大量テストデータ生成
  - 100～10,000問の問題自動生成
  - 回答履歴シミュレーション
  - 様々な正解率パターンでのテストケース作成

- **performance-tester.js**: パフォーマンス測定
  - 各フェーズでの処理時間測定
  - スケーラビリティテスト
  - ボトルネック発見・分析

**主な作業内容**:
- 大量データでのテスト環境構築
- アルゴリズムの性能評価
- 負荷テスト・ストレステスト実装

### チームB: UI・UX機能
**担当ファイル**: `js/ui/`

- **ui-manager.js**: 画面制御
  - 画面遷移管理
  - メニュー表示制御
  - レスポンシブ対応

- **app-initialization.js**: アプリ初期化
  - DOM読み込み処理
  - グローバル関数定義
  - テストモード機能

**主な作業内容**:
- ユーザビリティ改善
- 新機能UI追加
- アクセシビリティ対応

### チームC: コアロジック機能
**担当ファイル**: `js/core/`

- **quiz-logic.js**: クイズ選択アルゴリズム
  - フェーズ別問題選択
  - 適応学習ロジック
  - バランス調整

- **statistics-calculator.js**: 統計計算エンジン
  - 正解率計算
  - パフォーマンス分析
  - データ視覚化

**主な作業内容**:
- アルゴリズムの精度向上
- 新しい学習ロジック開発
- 統計分析機能拡張

## 🔧 開発ルール

### 1. **ファイル分離原則**
- 各チームは担当ディレクトリ内でのみ作業
- 他チームのファイルは読み取り専用
- 共通インターフェースを通じて連携

### 2. **API設計**
- 各モジュールは独立したクラス構造
- グローバルインスタンスで他チームから利用
- 純粋関数での実装を推奨

### 3. **テスト方針**
```javascript
// チームA: シミュレーションテスト
performanceTester.testQuizLogicPerformance(1000, 10000);

// チームB: UI統合テスト
uiManager.runInitializationTest();

// チームC: ロジックテスト
const questions = quizLogic.selectQuestionsWithAdaptiveLearning(records, questions);
```

## 🚀 利用方法

### シミュレーション実行（チームA）
```javascript
// 100問で性能テスト
await performanceTester.testQuizLogicPerformance(100);

// 1000問のテストデータ生成
const testData = dataGenerator.generateRandomQuestions(1000);

// ストレステスト
await performanceTester.runStressTest(10000, 100000);
```

### UI機能拡張（チームB）
```javascript
// 新しい画面追加
uiManager.showScreen('newScreen');

// 初期化テスト追加
uiManager.runInitializationTest();

// カスタムメニュー
uiManager.toggleQuizDataMenu();
```

### コアロジック改良（チームC）
```javascript
// フェーズ別問題選択
const questions = quizLogic.selectQuestionsForPhase(2, records, allQuestions);

// 統計計算
const stats = statisticsCalculator.calculateStatistics(records, questions);

// 正解率ベース選択
const adaptive = quizLogic.selectQuestionsBasedOnAccuracy(records, questions);
```

## 📊 進捗管理

### 現状（v0.36）
- ✅ 基本機能完成
- ✅ 3チーム構造分離完了
- ✅ テストモード機能実装済み

### 次のマイルストーン
- **チームA**: 100問以上での動作検証
- **チームB**: UI改善・新機能追加
- **チームC**: アルゴリズム精度向上

---
**重要**: 「現状を破壊しないように」段階的に進めてください！
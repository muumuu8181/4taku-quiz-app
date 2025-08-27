// プログラミング4択クイズ問題データ
const allQuestions = [
    {
        id: "Q001",
        question: "HTMLの正式名称はなんでしょうか？",
        options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperText Modern Language"],
        correct: 0
    },
    {
        id: "Q002",
        question: "CSSはなんの略でしょうか？",
        options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Common Style Sheets"],
        correct: 2
    },
    {
        id: "Q003",
        question: "JavaScriptでアラートを表示する関数はどれでしょうか？",
        options: ["alert()", "popup()", "show()", "display()"],
        correct: 0
    },
    {
        id: "Q004",
        question: "HTMLで最も大きな見出しを表すタグはどれでしょうか？",
        options: ["<h6>", "<h1>", "<header>", "<title>"],
        correct: 1
    },
    {
        id: "Q005",
        question: "CSSで文字色を変更するプロパティはどれでしょうか？",
        options: ["font-color", "text-color", "color", "foreground"],
        correct: 2
    },
    {
        id: "Q006",
        question: "JavaScriptで変数を宣言するキーワードはどれでしょうか（ES6以降推奨）？",
        options: ["var", "let", "int", "string"],
        correct: 1
    },
    {
        id: "Q007",
        question: "HTMLでリンクを作成するタグはどれでしょうか？",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correct: 1
    },
    {
        id: "Q008",
        question: "HTMLでコメントを書く記法はどれでしょうか？",
        options: ["// コメント", "/* コメント */", "<!-- コメント -->", "# コメント"],
        correct: 2
    },
    {
        id: "Q009",
        question: "CSSで背景色を設定するプロパティはどれでしょうか？",
        options: ["color", "background-color", "bg-color", "back-color"],
        correct: 1
    },
    {
        id: "Q010",
        question: "JavaScriptで条件分岐に使用するキーワードはどれでしょうか？",
        options: ["if", "when", "check", "condition"],
        correct: 0
    },
    {
        id: "Q011",
        question: "HTMLで画像を表示するタグはどれでしょうか？",
        options: ["<picture>", "<image>", "<img>", "<photo>"],
        correct: 2
    },
    {
        id: "Q012",
        question: "CSSでフォントサイズを設定するプロパティはどれでしょうか？",
        options: ["text-size", "font-size", "size", "font-weight"],
        correct: 1
    },
    {
        id: "Q013",
        question: "JavaScriptでループ処理に使用するキーワードはどれでしょうか？",
        options: ["repeat", "loop", "for", "iterate"],
        correct: 2
    },
    {
        id: "Q014",
        question: "HTMLでフォームを作成するタグはどれでしょうか？",
        options: ["<form>", "<input>", "<field>", "<data>"],
        correct: 0
    },
    {
        id: "Q015",
        question: "CSSで要素の幅を設定するプロパティはどれでしょうか？",
        options: ["size", "width", "length", "scale"],
        correct: 1
    },
    {
        id: "Q016",
        question: "JavaScriptで文字列を結合する演算子はどれでしょうか？",
        options: ["&", "+", "*", "++"],
        correct: 1
    },
    {
        id: "Q017",
        question: "HTMLでテーブルを作成するタグはどれでしょうか？",
        options: ["<table>", "<grid>", "<tab>", "<list>"],
        correct: 0
    },
    {
        id: "Q018",
        question: "CSSで要素を非表示にするプロパティ値はどれでしょうか？",
        options: ["visible: false", "show: none", "display: none", "hide: true"],
        correct: 2
    },
    {
        id: "Q019",
        question: "JavaScriptで配列に要素を追加するメソッドはどれでしょうか？",
        options: ["add()", "append()", "push()", "insert()"],
        correct: 2
    },
    {
        id: "Q020",
        question: "HTMLで改行を表すタグはどれでしょうか？",
        options: ["<br>", "<newline>", "<nl>", "<break>"],
        correct: 0
    },
    {
        id: "Q021",
        question: "CSSでボーダーを設定するプロパティはどれでしょうか？",
        options: ["outline", "border", "frame", "edge"],
        correct: 1
    },
    {
        id: "Q022",
        question: "JavaScriptで数値を文字列に変換するメソッドはどれでしょうか？",
        options: ["toText()", "toString()", "convert()", "stringify()"],
        correct: 1
    },
    {
        id: "Q023",
        question: "HTMLでリストを作成するタグはどれでしょうか？",
        options: ["<list>", "<ul>", "<items>", "<array>"],
        correct: 1
    },
    {
        id: "Q024",
        question: "CSSで要素の位置を絶対位置にするプロパティ値はどれでしょうか？",
        options: ["position: fixed", "position: absolute", "position: relative", "position: static"],
        correct: 1
    },
    {
        id: "Q025",
        question: "JavaScriptでオブジェクトのプロパティにアクセスする記法はどれでしょうか？",
        options: ["obj->property", "obj.property", "obj::property", "obj[property]"],
        correct: 1
    },
    {
        id: "Q026",
        question: "HTMLでヘッダー部分を表すタグはどれでしょうか？",
        options: ["<header>", "<head>", "<top>", "<title>"],
        correct: 0
    },
    {
        id: "Q027",
        question: "CSSでマージン（外側の余白）を設定するプロパティはどれでしょうか？",
        options: ["padding", "margin", "space", "gap"],
        correct: 1
    },
    {
        id: "Q028",
        question: "JavaScriptでイベントリスナーを追加するメソッドはどれでしょうか？",
        options: ["addListener()", "addEventListener()", "attachEvent()", "onEvent()"],
        correct: 1
    },
    {
        id: "Q029",
        question: "HTMLで入力フィールドを作成するタグはどれでしょうか？",
        options: ["<field>", "<textbox>", "<input>", "<text>"],
        correct: 2
    },
    {
        id: "Q030",
        question: "CSSでフレックスボックスを使用するプロパティ値はどれでしょうか？",
        options: ["display: flex", "layout: flex", "flex: true", "flexbox: on"],
        correct: 0
    }
];
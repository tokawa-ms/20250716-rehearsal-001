# 株主対話エージェント - 仕様書

## 概要

株主対話エージェントは、株主総会における株主と取締役の対話をシミュレーションするWebアプリケーションです。PDFファイルの決算短信や株主総会資料を参照し、Azure OpenAI GPT-4を活用して自然な対話を生成します。

## 主な機能

### 1. Azure OpenAI 接続機能
- Azure OpenAI エンドポイントとAPIキーの設定
- 接続テスト機能
- 接続状態の表示

### 2. PDF資料管理機能
- PDFファイルのアップロード（ドラッグ&ドロップ対応）
- アップロードファイル一覧表示
- PDFプレビュー機能
- ファイル削除機能

### 3. 対話シミュレーション機能
- 株主の質問自動生成
- 取締役の回答自動生成
- 5回の対話セット実行
- 対話履歴の表示
- 対話要約の生成

## UI/UX設計

### レイアウト構成
- **ヘッダー**: アプリケーションタイトルと説明
- **接続設定パネル**: Azure OpenAI の設定エリア
- **左側パネル**: PDF資料管理エリア
- **右側パネル**: 対話表示エリア

### 対話表示の特徴
- **株主**: 青系の吹き出し、右寄せ、「株」アイコン
- **取締役**: 緑系の吹き出し、左寄せ、「役」アイコン
- **要約**: 黄系の吹き出し、中央表示、「要」アイコン

## 技術仕様

### フロントエンド技術
- **HTML5**: セマンティックなマークアップ
- **CSS3**: TailwindCSS（CDN）によるスタイリング
- **JavaScript ES6**: モダンなJavaScript機能

### 外部ライブラリ
- **PDF.js**: PDFファイルの処理とプレビュー
- **TailwindCSS**: ユーティリティファーストCSS
- **Azure OpenAI API**: 対話生成

### 主要な機能実装

#### PDFテキスト抽出
```javascript
// PDF.jsを使用してテキストを抽出
async function extractTextFromPDF(file) {
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}
```

#### 対話生成ロジック
1. **株主質問生成**: PDF内容と対話履歴を参考に質問を生成
2. **取締役回答生成**: 株主質問とPDF内容に基づいて回答を生成
3. **要約生成**: 全体の対話内容を要約

#### Azure OpenAI API連携
```javascript
const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'api-key': azureConfig.apiKey
    },
    body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7
    })
});
```

## セキュリティとプライバシー

### APIキーの取り扱い
- UIでの入力方式（ハードコーディングなし）
- セッション中のメモリ保存のみ
- ページリロード時の情報クリア

### ファイル処理
- ローカルブラウザ内での処理
- サーバーへのファイルアップロードなし
- クライアントサイドでのテキスト抽出

## 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 使用方法

1. **接続設定**: Azure OpenAI のエンドポイントとAPIキーを入力
2. **接続テスト**: 「接続テスト」ボタンで接続を確認
3. **PDF アップロード**: 決算短信や株主総会資料をアップロード
4. **ファイル選択**: アップロードしたファイルを選択してプレビュー確認
5. **対話開始**: 「対話開始」ボタンで株主対話をスタート
6. **結果確認**: 5回の対話と要約を確認

## 制限事項

- PDFファイルサイズ: 推奨10MB以下
- テキスト長: Azure OpenAI APIの制限に準拠（約8000文字）
- 対話回数: 固定5回
- 同時処理: 単一対話のみ

## 今後の拡張可能性

- 対話回数の設定可能化
- 複数PDF同時参照
- 対話履歴の保存・読み込み
- エクスポート機能（PDF、テキスト）
- 音声読み上げ機能
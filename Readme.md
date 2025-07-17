# 🏢 株主対話エージェント (Shareholder Dialogue Agent)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-0078D4?style=flat&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/services/cognitive-services/openai-service/)

> 株主総会における株主と取締役の対話をシミュレーションするAI搭載Webアプリケーション

## 📋 概要

株主対話エージェントは、株主総会における株主と取締役の対話をシミュレーションするWebアプリケーションです。Azure OpenAI GPT-4を活用して、決算短信や株主総会資料を基にした自然で現実的な対話を生成します。

### ✨ 主な特徴

- 🤖 **AI対話生成** - Azure OpenAI GPT-4による自然な株主・取締役間の対話
- 📊 **PDF資料対応** - 決算短信・株主総会資料のアップロードとプレビュー
- 💬 **リアルタイム対話** - 5回の質疑応答セットを自動実行
- 🔐 **セキュア設計** - ローカル処理でAPIキーの安全な管理
- 📱 **レスポンシブUI** - TailwindCSSによる美しいデザイン
- 🎯 **デモモード** - APIキーなしでも動作確認可能

## 🛠️ 技術スタック

### フロントエンド

| 技術                                     | バージョン | 用途                         |
| ---------------------------------------- | ---------- | ---------------------------- |
| HTML5                                    | Latest     | セマンティックなマークアップ |
| CSS3                                     | Latest     | スタイリング                 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x (CDN)  | ユーティリティファースト CSS |
| JavaScript                               | ES6+       | インタラクティブな機能       |
| [PDF.js](https://mozilla.github.io/pdf.js/) | 3.11.x     | PDFファイルの表示・処理      |

### AI・クラウド

| サービス                                 | 用途                         |
| ---------------------------------------- | ---------------------------- |
| [Azure OpenAI](https://azure.microsoft.com/services/cognitive-services/openai-service/) | GPT-4による対話生成          |
| Azure Cognitive Services                | テキスト分析・要約生成       |

### 開発ツール

- **GitHub Copilot** - AI ペアプログラミング
- **Visual Studio Code** - 推奨 IDE
- **PDF.js** - PDFドキュメント処理

## 📁 プロジェクト構造

```
📦 vibes-kabunushi-agent-demo/
├── 📄 Readme.md                  # プロジェクト概要
├── 📄 LICENSE                    # MITライセンス
├── 📁 .github/                   # GitHub設定
│   └── 📄 copilot-instructions.md # GitHub Copilot設定
├── 📁 docs/                      # ドキュメント
│   ├── 📄 README.md              # 機能詳細
│   ├── 📄 specification.md       # 仕様書
│   ├── 📄 usage.md               # 使用方法
│   ├── 📄 feature_updates.md     # 機能アップデート
│   └── 📄 test_procedures.md     # テスト手順
└── 📁 src/                       # アプリケーションソース
    ├── 📄 index.html             # メインHTML
    ├── 📁 css/                   # スタイルシート
    │   └── 📄 styles.css         # カスタムCSS
    └── 📁 js/                    # JavaScript
        └── 📄 script.js          # メインスクリプト
```

## 🚀 クイックスタート

### 前提条件

- 📌 モダンな Web ブラウザ (Chrome 90+, Firefox 88+, Safari 14+)
- 📌 Azure OpenAI サービスのアカウント（本格利用の場合）
- 📌 Visual Studio Code (開発時推奨)

### セットアップ手順

#### 🎯 デモモードでの利用（推奨）

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/tokawa-ms/vibes-kabunushi-agent-demo.git
   cd vibes-kabunushi-agent-demo
   ```

2. **アプリケーションの起動**

   ```bash
   # ブラウザで開く
   open src/index.html
   # または
   code . && open src/index.html
   ```

3. **デモモードでの接続**

   - **Azure OpenAI エンドポイント**: `demo` と入力
   - **APIキー**: `demo` と入力
   - **接続テスト**ボタンをクリック

4. **サンプルデータでテスト**

   - ブラウザの開発者コンソールを開く
   - 以下のコマンドを実行してサンプルデータを読み込み：
     ```javascript
     document.getElementById('loadSampleBtn').click();
     ```
   - **対話開始**ボタンで対話をスタート

#### 🔑 Azure OpenAI を使用した本格利用

1. **Azure OpenAI の準備**

   ```bash
   # Azure CLI でリソース作成（オプション）
   az cognitiveservices account create \
     --name your-openai-resource \
     --resource-group your-rg \
     --kind OpenAI \
     --sku S0 \
     --location eastus
   ```

2. **設定の入力**

   - **エンドポイント**: `https://your-resource.openai.azure.com/`
   - **APIキー**: Azure ポータルから取得
   - **モデルデプロイ名**: GPT-4のデプロイメント名
   - **APIバージョン**: `2024-02-15-preview`

3. **PDF資料のアップロード**

   - 決算短信、株主総会招集通知等をアップロード
   - ドラッグ&ドロップまたはクリックでファイル選択

4. **対話の実行**
   - **対話開始**ボタンで5回の質疑応答を自動実行
   - 対話履歴と要約を確認

## 💡 主要機能

### 🔗 Azure OpenAI 接続

```javascript
// 接続設定の例
const azureConfig = {
  endpoint: "https://your-resource.openai.azure.com/",
  apiKey: "your-api-key",
  deployment: "gpt-4-deployment",
  apiVersion: "2024-02-15-preview"
};
```

### 📊 PDF資料処理

```javascript
// 対応ファイル形式
- 決算短信 (PDF)
- 株主総会招集通知 (PDF)
- 有価証券報告書 (PDF)
- その他の企業資料 (PDF)
```

### 🤖 AI対話生成

```javascript
// 対話の流れ
1. 株主からの質問生成
2. 取締役からの回答生成
3. 5回の質疑応答セット
4. 対話要約の自動生成
```

### 🎨 ユーザーインターフェース

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **ドラッグ&ドロップ**: 直感的なファイルアップロード
- **リアルタイムプレビュー**: PDFの即座表示
- **プログレス表示**: 対話生成の進捗状況

## 📱 対応デバイス・ブラウザ

このアプリケーションは以下の環境で動作確認済みです：

### デバイス対応

- 📱 **スマートフォン**: 320px〜768px
- 📊 **タブレット**: 768px〜1024px  
- 💻 **デスクトップ**: 1024px 以上

### ブラウザ対応

| ブラウザ | バージョン | 対応状況 |
|----------|------------|----------|
| Chrome | 90+ | ✅ 完全対応 |
| Firefox | 88+ | ✅ 完全対応 |
| Safari | 14+ | ✅ 完全対応 |
| Edge | 90+ | ✅ 完全対応 |

## 🔒 セキュリティとプライバシー

### データ保護

- ✅ **ローカル処理**: すべてのデータはブラウザ内で処理
- ✅ **APIキー管理**: UI入力方式でハードコーディング回避
- ✅ **セッション管理**: ページリロード時の自動クリア
- ❌ **データ送信なし**: サーバーへの永続化は行わない

### Azure OpenAI 利用時の注意

- 🔐 本番環境では専用のAPIキーを使用
- 📝 Azure OpenAIの利用規約に準拠
- 🚫 機密情報を含むPDFの使用は避ける
- ⚠️ デモ用途でのみ使用を推奨

### ベストプラクティス

- 📋 定期的なAPIキーのローテーション
- 🧪 本番データでのテストは避ける
- 📊 適切なエラーハンドリングの実装

## 📚 ドキュメント

詳細なドキュメントは `docs/` ディレクトリ内にあります：

- 📖 **[機能詳細](docs/README.md)** - アプリケーションの詳細機能
- 📋 **[仕様書](docs/specification.md)** - 技術仕様と設計
- 🚀 **[使用方法](docs/usage.md)** - 詳細な操作手順
- 🔄 **[機能アップデート](docs/feature_updates.md)** - 最新の機能追加
- 🧪 **[テスト手順](docs/test_procedures.md)** - 動作確認方法

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

### 開発ガイドライン

- 🎌 **日本語優先**: コメントとドキュメントは日本語で記述
- 🧪 **テスト重視**: 新機能にはテストケースを追加
- 📝 **ドキュメント**: 機能追加時はドキュメントも更新

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🆘 サポートとリソース

### 技術サポート

- 📖 **Azure OpenAI**: [Azure OpenAI Service Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)
- 🔧 **PDF.js**: [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- 🎨 **Tailwind CSS**: [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### フィードバック

- 🐛 **バグ報告**: [Issues](https://github.com/tokawa-ms/vibes-kabunushi-agent-demo/issues)
- 💡 **機能提案**: [Discussions](https://github.com/tokawa-ms/vibes-kabunushi-agent-demo/discussions)
- 📧 **直接連絡**: プロジェクトメンテナーへ

## 📊 プロジェクト統計

![GitHub stars](https://img.shields.io/github/stars/tokawa-ms/vibes-kabunushi-agent-demo?style=social)
![GitHub forks](https://img.shields.io/github/forks/tokawa-ms/vibes-kabunushi-agent-demo?style=social)
![GitHub issues](https://img.shields.io/github/issues/tokawa-ms/vibes-kabunushi-agent-demo)

## 🔮 今後の予定

- [ ] **音声対話機能** - 音声による質疑応答
- [ ] **多言語対応** - 英語・中国語での対話生成
- [ ] **Excel対応** - 財務データの直接読み込み
- [ ] **グラフ表示** - 財務指標の可視化
- [ ] **履歴保存** - 過去の対話履歴の保存・検索

---

<div align="center">
  <strong>🏢 株主と企業をつなぐAI対話プラットフォーム 🤖</strong><br>
  Made with ❤️ by GitHub Copilot & Azure OpenAI
</div>

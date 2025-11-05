# WOOLsite

プライバシーを重視したYouTube動画視聴・ダウンロードサービス

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## 🌟 特徴

- **プライバシー保護**: 追跡なし、広告なし
- **複数API対応**: Invidious (35+) と Piped (30+) の65以上のインスタンス
- **サーバーサイドストリーミング**: ストリームをサーバー経由で取得
- **ダウンロード機能**: MP4、WebM、MP3、M4A形式でダウンロード可能
- **品質選択**: 複数の画質から選択可能
- **自動フォールバック**: 接続失敗時に自動で別インスタンスに切り替え
- **レスポンシブデザイン**: PC・タブレット・スマホ対応

## 📁 ファイル構成


## 🚀 デプロイ方法

### Renderへのデプロイ（推奨）

1. GitHubにリポジトリを作成してプッシュ
2. [Render](https://render.com)にサインアップ
3. "New Web Service"をクリック
4. GitHubリポジトリを接続
5. 以下の設定を入力：
   - **Name**: woolsite
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. "Create Web Service"をクリック

## 🔧 設定

## 🎯 使い方

1. **ツール**: ツールページから選ぶ
2. **視聴**: wooltubeを選択
3. **ダウンロード**: wooltubeの動画DLをクリック

## 🛡️ プライバシー

- YouTubeに直接接続しません
- ユーザーの視聴履歴を記録しません
- トラッキングスクリプトは一切使用していません
- すべてのストリームはサーバー経由で取得

## 🔒 セキュリティ

- CORS設定済み
- ストリームプロキシでユーザーIPを保護
- タイムアウト設定で無限待機を防止
- User-Agent偽装でブロック回避

## 🌐 本番環境の設定

### パフォーマンス最適化

- キャッシュヘッダーを設定済み
- ストリームバッファリングを最適化
- タイムアウト値を適切に設定

## 📊 対応API

### Invidious (35+ インスタンス)
- invidious.snopyta.org
- invidious.kavin.rocks
- vid.puffyan.us
- yewtu.be
- その他30以上

### Piped (30+ インスタンス)
- pipedapi.kavin.rocks
- api-piped.mha.fi
- pipedapi.adminforge.de
- その他25以上

## 🐛 トラブルシューティング


## 🤝 貢献

プルリクエストを歓迎します！

## 📄 ライセンス

AGPL-3.0 license

## ⚠️ 免責事項

このソフトウェアは教育目的で提供されています。著作権法を遵守し、適切に使用してください。

## 🔗 リンク

- [padlet](https://padlet.com/woolisbest/open)
- [googlesite](https://sites.google.com)
- [お題箱](https://odaibako.net/u/woolisbest)

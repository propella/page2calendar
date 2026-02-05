# Page to Calendar - Chrome拡張機能

[English](README.md)

美術展などのウェブページからイベント情報をClaude AIで抽出し、Googleカレンダーに登録するChrome拡張機能です。

## 機能

- Claude AIがページ内容を解析し、イベント情報（タイトル、会期、場所、概要）を自動抽出
- 抽出結果は編集可能
- ワンクリックでGoogleカレンダーに登録

## 必要なもの

- Google Chrome ブラウザ
- Gemini または Claude の API Key
    - Gemini API キー ([API keys | Google AI Studio](https://aistudio.google.com/app/api-keys))
    - Claude API キー（[Anthropic Console](https://console.anthropic.com/)）

## インストール方法

1. このフォルダをダウンロードまたはクローン
2. Chromeで `chrome://extensions` を開く
3. 右上の「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `page2calendar` フォルダを選択
6. 拡張機能がインストールされ、ツールバーにアイコンが表示される

## 使い方

1. イベント情報のあるウェブページ（美術展ページなど）を開く
2. ツールバーの拡張機能アイコンをクリック
3. 初回のみ：Claude APIキーを入力して「保存」をクリック
4. 「情報を抽出」ボタンをクリック
5. 抽出された情報を確認・必要に応じて編集
6. 「Googleカレンダーに登録」をクリック
7. Googleカレンダーが開き、イベント作成画面が表示される

## ファイル構成

```
page2calendar/
├── manifest.json   # 拡張機能設定
├── popup.html      # ポップアップUI
├── popup.js        # メインロジック
├── content.js      # ページ情報取得
├── styles.css      # スタイル
├── _locales/       # 多言語対応
├── icons/          # アイコン
└── README.md
```

## 注意事項

- APIキーはブラウザのローカルストレージに保存されます
- Claude API の利用には料金が発生する場合があります
- 抽出精度はページの構造により異なります。必ず結果を確認してください

## トラブルシューティング

**「情報を抽出」が動作しない場合**
- APIキーが正しく入力されているか確認
- ページが完全に読み込まれてから実行

**抽出結果が正しくない場合**
- フォームで手動修正可能です
- 日付形式は YYYY-MM-DD で入力してください

## ライセンス

MIT License

## プライバシーポリシー

[PRIVACY_POLICY.md](PRIVACY_POLICY.md) を参照してください。

## Chrome Web Store 公開手順

zip 作成:

```bash
./build.sh
# 出力: ../page2calendar.zip
```

* [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) にアクセス
* 「新しいアイテム」ボタンをクリック
* 作成した ZIP ファイルをアップロード

## 更新時の手順

1. `manifest.json` の `version` を更新（例：1.0.0 → 1.0.1）
2. 新しい ZIP ファイルを作成
3. Developer Dashboard で該当アイテムを選択
4. 「パッケージ」タブで新しい ZIP をアップロード
5. 再度審査に提出

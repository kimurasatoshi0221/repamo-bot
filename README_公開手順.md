# リペモ マニュアル チャットbot 公開手順（GitHub + Cloudflare Pages）

画像をデータ化してファイルにまとめたので、**アップロードするファイルは 8 個だけ**になりました。これで GitHub の「一度に 100 ファイルまで」の制限に引っかかりません。

## このフォルダの中身（全 8 ファイル）

- `index.html` … チャットbot本体
- `imgdata_honbu.json` / `imgdata_okyakusama.json` / `imgdata_sekoten.json` … 画面画像をまとめたデータ（役割ごと）
- `functions/api/chat.js` … サーバー側関数（API キーを使う唯一の場所）
- `_headers` … キャッシュ設定
- `wrangler.toml` … Cloudflare 設定
- `.gitignore`

---

## ステップ 1：GitHub にファイルをアップロード

すでにリポジトリ（例：repamo-bot）は作成済みなので、その続きです。

1. リポジトリの「Add file」→「Upload files」（または前回の Drag files 画面）
2. **このフォルダの中身を全部**ドラッグ&ドロップ
   - index.html、imgdata_*.json 3つ、_headers、wrangler.toml、.gitignore
   - functions フォルダもドラッグ（中の api/chat.js の階層が保たれます）
   - 今回は 8 ファイルだけなので「100 件まで」の警告は出ません
3. 下の「Commit changes」を押す

> functions フォルダがうまく入らない場合は、先に他のファイルをコミットしてから、もう一度「Add file → Upload files」で functions フォルダだけ追加してください。最終的に functions/api/chat.js がリポジトリにある状態になればOKです。

---

## ステップ 2：Cloudflare Pages と連携

1. dash.cloudflare.com →「Workers & Pages」→「Create application」
2. 「Connect to Git」（または Connect GitHub）を選び、repamo-bot リポジトリを選択
3. ビルド設定：
   - Framework preset：None
   - Build command：空欄
   - Build output directory：/
4. 「Save and Deploy」→ https://repamo-bot.pages.dev のような URL が発行されます

---

## ステップ 3：API キーを登録（AI回答モードに必要）

1. プロジェクトの「Settings」→「Environment variables」
2. 「Add variable」：
   - 変数名：ANTHROPIC_API_KEY
   - 値：sk-ant-...（console.anthropic.com で取得・要クレジット）
   - 「Encrypt」を選んで保存
3. 「Deployments」→ 最新のデプロイで「Retry deployment」して反映
4. URL を開き、AI回答モードで返答が出れば完了

---

## 動作の仕組み（軽く）

- 画像はブラウザが起動時／役割切替時に imgdata_*.json から読み込んで表示します（最初の表示が一瞬「読み込み中」になることがあります）
- AI回答モードは functions/api/chat.js 経由で Claude を呼びます。API キーはサーバー側にあり、ブラウザには出ません
- 検索モードは API キー不要・無料で動きます

## うまくいかないとき

- AI回答でエラー → 環境変数 ANTHROPIC_API_KEY の登録と再デプロイを確認
- 画像が出ない → imgdata_*.json がリポジトリにコミットされているか確認
- 「Pages Functions はサポートされていません」→ それは「直接アップロード」方式の画面です。必ず Git 連携（ステップ2）で進めてください

## コスト・アクセス制限

- AI回答は Claude Haiku 固定で 1 質問数円、検索モードは無料
- 公開URLを限定したい場合は Cloudflare Access（メール認証・無料枠あり）が使えます

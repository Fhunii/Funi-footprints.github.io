# Funi-footprints

静的な謎解きページです。ブラウザ内でハッシュ照合のみ行い、正解の平文は保持しません。

## 回答を差し替える手順
独自の答えに更新したい場合は、以下の手順でハッシュを生成し、`script.js` の定数を差し替えてください。

1. 好きな答えを決めて前後の空白を除去し、大文字化したものを最終入力値とする。（例: `"night sky"` → `"NIGHT SKY"`）
2. `script.js` 上部の `PEPPER` を必要に応じて変更する（推測されにくい英数字を推奨）。
3. Node.js などで SHA-256 を計算し、`ANSWER_HASH` に貼り付ける。

```bash
# 例: Node.js でハッシュを計算
node -e "const crypto=require('crypto'); const answer='MOONLIGHT'; const pepper='moonlit-pepper-2025'; const normalized=answer.trim().toUpperCase(); const hash=crypto.createHash('sha256').update(`${pepper}:${normalized}`).digest('hex'); console.log(hash);"
```

4. 計算した 64 文字のハッシュを `script.js` の `ANSWER_HASH` に設定する。

> フロントエンドはハッシュ比較のみを行うため、平文を公開せずに答えを差し替えられます。

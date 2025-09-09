# ローカル開発環境ガイド

## 📦 初回セットアップ

### 1. 依存関係のインストール
```bash
bun install
```

### 2. データベースのセットアップ
```bash
bun run --filter "@survey-poc/database" db:setup
```

これにより以下が実行されます：
- Prisma Clientの生成
- データベーススキーマの作成
- モックデータの投入

## 🚀 開発サーバーの起動

```bash
bun dev
```

- Next.jsアプリ: http://localhost:3000
- tRPCサーバー: Next.js内で動作（別途起動不要）

## 🗄️ データベース管理

### データベースファイルの場所
```
packages/database/prisma/dev.db
```

### よく使うコマンド


### データベースを初期化

```
bun --filter "@survey-poc/database" db:migrate:dev -- --name init
```

#### データベースの内容を確認（GUI）
```bash
bun db:studio
```
→ http://localhost:5555 でPrisma Studioが開きます

#### データベースをリセット（クリーンな状態に）
```bash
bun db:reset
```

#### シードデータのみ再投入
```bash
bun db:seed
```

## 🔧 環境変数

ローカル開発では基本的に環境変数の設定は不要ですが、必要に応じて `.env.local` を作成できます：

```bash
# .env.localの例（通常は不要）
DATABASE_URL="file:./dev.db"  # デフォルト値
```

### Basic認証を有効にする場合
```bash
BASIC_AUTH_USER="admin"
BASIC_AUTH_PASSWORD="password"
```

## 📝 開発フロー

### 1. 通常の開発
```bash
# 開発サーバー起動
bun dev

# 別ターミナルでデータベースを確認
bun db:studio
```

### 2. データベーススキーマを変更した場合
```bash
# 1. スキーマファイルを編集
# packages/database/prisma/schema.prisma

# 2. データベースを更新
cd packages/database
npx prisma db push

# 3. Prisma Clientを再生成
npx prisma generate
```

### 3. コードの品質チェック
```bash
# フォーマット
bun format

# リント
bun lint

# 型チェック
bun type-check
```

## 🐛 トラブルシューティング

### データベースエラーが発生した場合
```bash
# データベースを完全にリセット
bun db:reset
```

### 依存関係のエラー
```bash
# node_modulesをクリーンアップ
rm -rf node_modules
bun install
```

### ポート競合（3000番ポートが使用中）
```bash
# 別のポートで起動
PORT=3001 bun dev
```

## 💡 Tips

### SQLiteファイルを直接確認
```bash
# SQLiteコマンドラインツール（要インストール）
sqlite3 packages/database/prisma/dev.db

# テーブル一覧
.tables

# データ確認
SELECT * FROM Survey;
```

### モックデータのカスタマイズ
`packages/database/prisma/seed.ts` を編集してお好みのテストデータを作成できます。

```bash
# 編集後、シードを再実行
bun db:seed
```
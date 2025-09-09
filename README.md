# Survey PoC - 調査票自動化システム

AI調査アシスタント・調査票ライブラリを活用した現代的な調査プラットフォーム

## 🌟 主な機能

- 📊 **調査票作成・管理**: 直感的なUIで調査票を作成・編集
- 🤖 **AI調査アシスタント**: 参考調査票とルールモデルを基にした自動生成
- 📚 **調査票ライブラリ**: 20件以上の参考調査票から検索・選択
- 🔍 **キーワード検索**: チャット入力やファイルアップロードによる関連調査票の自動抽出
- 📱 **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- 🔒 **Basic認証**: セキュアなアクセス制御
- 📈 **プレビュー機能**: 調査票の事前確認（新規タブ表示）

## 🛠 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **バックエンド**: tRPC, Prisma ORM
- **データベース**: SQLite
- **パッケージマネージャー**: Bun
- **モノレポ**: Turborepo
- **UI コンポーネント**: shadcn/ui, Lucide React
- **デプロイ**: Google Cloud Run (Docker)

## 🚀 セットアップ

### 前提条件

- [Bun](https://bun.sh/) (最新版)
- Node.js 18+ (互換性のため)
- Docker (デプロイ時)

### ローカル開発環境

1. **リポジトリのクローン**:
```bash
git clone https://github.com/okazu3333/survey-top-new.git
cd survey-top-new
```

2. **依存関係のインストール**:
```bash
bun install
```

3. **データベースのセットアップ**:
```bash
bun run db:reset
```

4. **開発サーバーの起動**:
```bash
bun dev
```

アプリケーションは `http://localhost:3000` で利用できます。

### 🔐 認証情報

- **ユーザー名**: `cmgadmin`
- **パスワード**: `crossadmin`

## 📁 プロジェクト構造

```
├── apps/
│   ├── web/                    # Next.js フロントエンドアプリケーション
│   │   ├── app/               # App Router (Next.js 13+)
│   │   ├── components/        # 再利用可能なコンポーネント
│   │   └── lib/              # ユーティリティとライブラリ
│   └── api/                   # tRPC API ルート
├── packages/
│   └── database/              # Prisma データベースパッケージ
├── docs/                      # ドキュメント
├── scripts/                   # ビルド・デプロイスクリプト
├── Dockerfile                 # Cloud Run デプロイ用
├── deploy-cloudrun.sh         # 自動デプロイスクリプト
└── DEPLOYMENT.md              # デプロイ手順
```

## 🎯 主要機能の使い方

### 1. 調査アシスタント
1. **新規調査作成**ボタンをクリック
2. チャット入力またはファイルアップロードで要件を入力
3. 関連する参考調査票が自動表示
4. 調査票を選択してルールモデルを適用
5. **新規調査設計へ進む**で自動入力されたフォームを確認

### 2. 調査票ライブラリ
- **検索**: キーワードによる絞り込み
- **表示切替**: 6件 ⇄ 20件の表示切替
- **プレビュー**: 👁️ アイコンで新規タブプレビュー
- **クリア**: 検索条件のリセット

### 3. 調査票作成
- 参考調査票に基づく自動入力
- 調査目的・対象者条件・分析条件の設定
- リアルタイムバリデーション

## 📜 利用可能なスクリプト

- `bun dev` - 開発サーバー起動
- `bun build` - 本番ビルド
- `bun start` - 本番サーバー起動
- `bun lint` - ESLint 実行
- `bun format` - Prettier フォーマット
- `bun type-check` - TypeScript 型チェック
- `bun db:reset` - データベースリセット（シードデータ含む）

## 🌐 デプロイ

### Google Cloud Run

詳細な手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

**クイックデプロイ**:
```bash
# プロジェクトIDを設定
vim deploy-cloudrun.sh  # PROJECT_ID を変更

# デプロイ実行
./deploy-cloudrun.sh
```

**デプロイ設定**:
- **リージョン**: asia-northeast1 (東京)
- **メモリ**: 2GB
- **CPU**: 2コア
- **最大インスタンス**: 10

## 🔧 開発・カスタマイズ

### 新しい調査票テンプレートの追加

`apps/web/components/survey-assistant/SurveyLibrary.tsx` の `surveys` 配列に追加:

```typescript
{
  id: "21",
  title: "新しい調査票",
  client: "クライアント名",
  purpose: "調査目的",
  implementationDate: "2024年1月",
  tags: ["タグ1", "タグ2"],
  description: "調査の説明"
}
```

### ダミーデータの追加

`apps/web/app/(auth)/surveys/(chat)/new/page.tsx` の `generateDummyData` 関数を編集。

## 🤝 コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/okazu3333/survey-top-new/issues) でお知らせください。

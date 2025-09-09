# Survey PoC

Next.js 15 プロジェクトのセットアップ

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **Linter/Formatter**: Biome
- **UI Library**: shadcn/ui + Tailwind CSS
- **Form Library**: react-hook-form
- **Icons**: Lucide React
- **Component Documentation**: Storybook

## セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
bun dev

# ビルド
bun build

# プロダクション起動
bun start

# 型チェック
bun type-check

# リント
bun lint

# フォーマット
bun format
```

## Storybook

UIコンポーネントの確認とテストにはStorybookを使用します。

```bash
# Storybook開発サーバーの起動
npx storybook dev -p 6006

# Storybookのビルド
npx storybook build
```

ブラウザで `http://localhost:6006` にアクセスすると、以下のコンポーネントを確認できます：
- Button (全バリアント)
- Badge (全バリアント) 
- Card (複数例)
- Checkbox (各状態)
- DropdownMenu (各種設定)
- Table (複数例)

**注意**: StorybookはBun環境での制限により、直接 `npx` コマンドを使用してください。

```

## ディレクトリ構成

```
.
├── .storybook/       # Storybook設定
├── app/              # Next.js App Router
├── components/       
│   └── ui/          # shadcn/ui components (+ Storybook stories)
├── lib/             # ユーティリティ
├── public/          # 静的ファイル
└── stories/         # Storybookデフォルトストーリー
```
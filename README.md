# Ionic + Vue + orval Mock テンプレート

Ionic(Vue) で、バックエンド無しでも CRUD が動くスターター。
OpenAPI 仕様から orval で型・Vue Query クライアント・MSW モックを生成します。

## このテンプレートの使い方（触る場所 / 触らない場所）

1. `openapi/openapi.yaml` を自分の API 仕様に差し替える
2. `npm run api:gen` で再生成（型・vue-query composable・MSW モックが更新される）
3. `src/mocks/store.ts` と `src/mocks/handlers.ts` を自分のリソースに合わせて編集
4. **`src/api/generated/` は触らない**（再生成で上書きされる聖域）

## セットアップ

```
npm install
npm run api:gen
npm run msw:init
npm run dev
```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバ（MSW モック有効） |
| `npm run api:gen` | orval でコード生成 |
| `npm run build` | 型チェック + 本番ビルド（MSW 無し・実API直結） |
| `npm run test` | Vitest |
| `npm run storybook` | Storybook（同じ MSW モックを共有） |
| `npm run lint` | ESLint |

## 本番 API への差し替え

MSW は dev/Storybook 限定で起動します（`src/main.ts` の `import.meta.env.DEV` ガード）。
本番は `.env` に `VITE_API_BASE_URL` を設定して実 API に向けるだけです。

## アーキテクチャ

- データ取得: orval(vue-query) → `useXxxQuery` / `useXxxMutation`
- モック: MSW。サンプルリソースは `src/mocks/store.ts`（インメモリ）で CRUD を永続化。
- UI: `src/layouts/AppLayout.vue`（共通テンプレート）＋ Ionic 標準タグのみ。md 固定。

## 拡張ポイント（このテンプレには未実装・必要時に追加）

- 認証 / 認可
- ページネーション / 無限スクロール
- 楽観的更新（Vue Query の `onMutate`）
- 複数リソース（store/handlers をリソース単位に分割）
- E2E（Cypress/Playwright）
- i18n / Pinia

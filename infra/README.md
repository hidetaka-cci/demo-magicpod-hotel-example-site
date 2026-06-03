# Infrastructure (AWS CDK)

MagicPod × CircleCI デモ向けの **S3 バケット** を provision します。CloudFront は使わず、**S3 Static Website Hosting（HTTP）** で staging / 本番を公開します。

OIDC プロバイダ・Deploy 用 IAM ロール・バケットへの sync 権限は **AWS アカウント側の既存設定** で管理してください。この repo の CDK では作成しません。

## 作成されるリソース

| リソース | 用途 |
|---|---|
| S3 バケット（staging） | CircleCI `deploy-staging` の sync 先 |
| S3 バケット（production） | CircleCI `deploy-production` の sync 先 |

## 前提

- AWS CLI が設定済み（`aws sts get-caller-identity` が成功する）
- Node.js 24 + pnpm 11（リポジトリルートと同じ）
- CircleCI → AWS の OIDC / Deploy ロールはアカウント側で既に設定済み

## Bootstrap

### 1. 依存関係のインストール

```bash
# repository root
pnpm install
```

`infra/` は pnpm workspace メンバーです（[`pnpm-workspace.yaml`](../pnpm-workspace.yaml)）。

### 2. CDK bootstrap（アカウント初回のみ）

```bash
cd infra
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
pnpm exec cdk bootstrap aws://${AWS_ACCOUNT_ID}/ap-northeast-1
```

### 3. スタックのデプロイ

CloudFormation スタック名: **`DemoMagicpodHotelExampleSite`**（この repo サンプル用）

```bash
cd infra
pnpm exec cdk deploy
```

### 4. アカウント側で sync 権限を付与

デプロイ後の Output（バケット名 / ARN）を、アカウント管理者または共有 IaC に渡し、**既存の CircleCI Deploy ロール** に次を許可してください。

- `s3:ListBucket` on bucket ARN
- `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject` on `bucket-arn/*`

OIDC の trust policy は変更不要です（org 既存設定をそのまま利用）。

### 5. CircleCI Context

| Output | Context 変数名（例） |
|---|---|
| `StagingBucketName` | `S3_STAGING_BUCKET_NAME`（バケット名。ARN ではない） |
| `ProductionBucketName` | `S3_PRODUCTION_BUCKET_NAME`（バケット名。ARN ではない） |
| `StagingWebsiteUrl` | MagicPod テスト設定のベース URL |
| `ProductionWebsiteUrl` | 本番確認用 |

Deploy ロール ARN（`AWS_ROLE_ARN_STAGING` / `AWS_ROLE_ARN_PRODUCTION`）と `AWS_DEFAULT_REGION=ap-northeast-1` は **アカウント既存の値** を Context に設定してください。

MagicPod 側では `StagingWebsiteUrl` をベース URL に設定します（例: `http://....amazonaws.com/en-US/`）。**HTTP の S3 Website エンドポイント**です。

### 6. 動作確認（任意）

権限付与後、staging バケットへ sync して:

```bash
curl -I "<StagingWebsiteUrl>/index.html"
```

`HTTP/1.1 200 OK` が返れば公開できています。

## 開発コマンド

```bash
cd infra
pnpm exec tsc --noEmit
pnpm exec cdk synth
pnpm exec cdk diff
```

## Teardown

```bash
cd infra
pnpm exec cdk destroy
```

`autoDeleteObjects` によりバケット内オブジェクトも削除されます。アカウント側の IAM ポリシーからバケット ARN の記述を削除するのを忘れないでください。

## 既知の制約

- **HTTP のみ**（CloudFront なし）。`s3 sync` 後すぐ反映されますが、HTTPS は使えません。
- MagicPod から S3 Website URL へ到達できることは、sync 後に手動で確認してください。

## 次のステップ（未実装）

- [`.circleci/config.yml`](../.circleci/config.yml) — build → staging → MagicPod E2E → production パイプライン

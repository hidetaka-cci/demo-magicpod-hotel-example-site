#!/usr/bin/env bash
# MagicPod E2E（公式 CircleCI 連携手順）+ Test Insights 用 JUnit XML 変換。
# https://support.magic-pod.com/hc/ja/articles/4408910495897
#
# 環境変数:
#   MAGICPOD_API_TOKEN, MAGICPOD_ORGANIZATION, MAGICPOD_PROJECT, MAGICPOD_SETTING_NUMBER
#   MAGICPOD_BATCH_RUN_NO_WAIT=1  … batch-run -n（終了を待たない。config.with-approval 用）
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULT_DIR="${REPO_ROOT}/test-results/magicpod"
LOG_FILE="${RESULT_DIR}/magicpod-batch.log"
CLIENT="${REPO_ROOT}/magicpod-api-client"

mkdir -p "${RESULT_DIR}"

# --- 1. 公式手順: magicpod-api-client でテスト一括実行 ---
OS=linux
curl -fsSL "https://app.magicpod.com/api/v1.0/magicpod-clients/api/${OS}/latest/" \
  -H "Authorization: Token ${MAGICPOD_API_TOKEN}" \
  --output "${CLIENT}.zip"
unzip -qo "${CLIENT}.zip" -d "${REPO_ROOT}"

export MAGICPOD_ORGANIZATION="${MAGICPOD_ORGANIZATION}"
export MAGICPOD_PROJECT="${MAGICPOD_PROJECT}"

NO_WAIT_ARGS=()
if [ -n "${MAGICPOD_BATCH_RUN_NO_WAIT:-}" ]; then
  NO_WAIT_ARGS+=(-n)
fi

set +e
"${CLIENT}" batch-run "${NO_WAIT_ARGS[@]}" -S "${MAGICPOD_SETTING_NUMBER}" | tee "${LOG_FILE}"
CLI_EXIT=${PIPESTATUS[0]}
set -e

# --- 2. Test Insights: 結果 JSON → JUnit XML（失敗時も収集を試みる）---
collect_junit_results() {
  local batch_run_no
  batch_run_no=$(grep -oE '#[0-9]+ wait' "${LOG_FILE}" 2>/dev/null | head -1 | grep -oE '[0-9]+' || true)
  if [ -z "${batch_run_no}" ]; then
    batch_run_no=$("${CLIENT}" latest-batch-run-no)
  fi
  echo "batch_run_number: ${batch_run_no}"

  "${CLIENT}" get-batch-run -b "${batch_run_no}" > "${RESULT_DIR}/batch_run_result.json"

  python3 "${REPO_ROOT}/scripts/magicpod_to_junit.py" \
    "${RESULT_DIR}/batch_run_result.json" \
    "${RESULT_DIR}/results.xml"
}

if ! collect_junit_results; then
  echo "Warning: failed to collect JUnit test results for CircleCI Test Insights" >&2
fi

exit "${CLI_EXIT}"

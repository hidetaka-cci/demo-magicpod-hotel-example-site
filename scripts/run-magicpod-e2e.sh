#!/usr/bin/env bash
# MagicPod E2E + Test Insights 用 JUnit XML 変換。
# https://support.magic-pod.com/hc/ja/articles/4408910495897
#
# 環境変数:
#   MAGICPOD_API_TOKEN, MAGICPOD_ORGANIZATION, MAGICPOD_PROJECT
#   MAGICPOD_SETTING_NUMBER        … 新規 batch-run 時（-S）
#   MAGICPOD_BATCH_RUN_NUMBER      … 既存 run を参照する場合（batch-run をスキップ）
#   MAGICPOD_BATCH_RUN_NO_WAIT=1   … batch-run -n（config.with-approval 用）
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULT_DIR="${REPO_ROOT}/test-results/magicpod"
LOG_FILE="${RESULT_DIR}/magicpod-batch.log"
CLIENT="${REPO_ROOT}/magicpod-api-client"

mkdir -p "${RESULT_DIR}"

OS=linux
curl -fsSL "https://app.magicpod.com/api/v1.0/magicpod-clients/api/${OS}/latest/" \
  -H "Authorization: Token ${MAGICPOD_API_TOKEN}" \
  --output "${CLIENT}.zip"
unzip -qo "${CLIENT}.zip" -d "${REPO_ROOT}"

export MAGICPOD_ORGANIZATION="${MAGICPOD_ORGANIZATION}"
export MAGICPOD_PROJECT="${MAGICPOD_PROJECT}"

CLI_EXIT=0

if [ -n "${MAGICPOD_BATCH_RUN_NUMBER:-}" ]; then
  echo "Reusing existing batch run #${MAGICPOD_BATCH_RUN_NUMBER}"
  echo "https://app.magicpod.com/${MAGICPOD_ORGANIZATION}/${MAGICPOD_PROJECT}/batch-run/${MAGICPOD_BATCH_RUN_NUMBER}/"
else
  NO_WAIT_ARGS=()
  if [ -n "${MAGICPOD_BATCH_RUN_NO_WAIT:-}" ]; then
    NO_WAIT_ARGS+=(-n)
  fi

  set +e
  "${CLIENT}" batch-run "${NO_WAIT_ARGS[@]}" -S "${MAGICPOD_SETTING_NUMBER}" | tee "${LOG_FILE}"
  CLI_EXIT=${PIPESTATUS[0]}
  set -e
fi

collect_junit_results() {
  local batch_run_no
  if [ -n "${MAGICPOD_BATCH_RUN_NUMBER:-}" ]; then
    batch_run_no="${MAGICPOD_BATCH_RUN_NUMBER}"
  else
    batch_run_no=$(grep -oE '#[0-9]+ wait' "${LOG_FILE}" 2>/dev/null | head -1 | grep -oE '[0-9]+' || true)
    if [ -z "${batch_run_no}" ]; then
      batch_run_no=$("${CLIENT}" latest-batch-run-no)
    fi
  fi
  echo "batch_run_number: ${batch_run_no}"

  "${CLIENT}" get-batch-run -b "${batch_run_no}" > "${RESULT_DIR}/batch_run_result.json"

  python3 "${REPO_ROOT}/scripts/magicpod_to_junit.py" \
    "${RESULT_DIR}/batch_run_result.json" \
    "${RESULT_DIR}/results.xml"

  if [ -n "${MAGICPOD_BATCH_RUN_NUMBER:-}" ]; then
    local status
    status=$(jq -r '.status' "${RESULT_DIR}/batch_run_result.json")
    echo "batch run status: ${status}"
    if [ "${status}" != "succeeded" ] && [ "${status}" != "unresolved" ]; then
      CLI_EXIT=1
    fi
  fi
}

if ! collect_junit_results; then
  echo "Warning: failed to collect JUnit test results for CircleCI Test Insights" >&2
  if [ -n "${MAGICPOD_BATCH_RUN_NUMBER:-}" ]; then
    exit 1
  fi
fi

exit "${CLI_EXIT}"

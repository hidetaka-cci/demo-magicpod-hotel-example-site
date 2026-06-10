#!/usr/bin/env bash
# MagicPod batch-run を API で開始し、完了後に JUnit XML へ変換する。
# 環境変数: MAGICPOD_API_TOKEN, MAGICPOD_ORGANIZATION, MAGICPOD_PROJECT,
#           MAGICPOD_SETTING_NUMBER
set -euo pipefail

API="https://app.magicpod.com/api/v1.0/${MAGICPOD_ORGANIZATION}/${MAGICPOD_PROJECT}"
AUTH="Authorization: Token ${MAGICPOD_API_TOKEN}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BATCH_RUN_NO=$(curl -sf -X POST "${API}/batch-run/" \
  -H "${AUTH}" -H "Content-Type: application/json" \
  -d "{\"test_settings_number\": ${MAGICPOD_SETTING_NUMBER}}" \
  | jq -r '.batch_run_number')

if [ -z "${BATCH_RUN_NO}" ] || [ "${BATCH_RUN_NO}" = "null" ]; then
  echo "Failed to start batch-run (no batch_run_number in response)"
  exit 1
fi
echo "batch_run_number: ${BATCH_RUN_NO}"

while :; do
  BODY=$(curl -sf "${API}/batch-run/${BATCH_RUN_NO}/" -H "${AUTH}")
  STATUS=$(echo "${BODY}" | jq -r '.status')
  [ "${STATUS}" != "running" ] && break
  sleep 30
done

mkdir -p test-results/magicpod
echo "${BODY}" > test-results/magicpod/batch_run_result.json

python3 "${REPO_ROOT}/scripts/magicpod_to_junit.py" \
  test-results/magicpod/batch_run_result.json \
  test-results/magicpod/results.xml

[ "${STATUS}" = "succeeded" ] || [ "${STATUS}" = "unresolved" ] || exit 1

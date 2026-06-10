#!/usr/bin/env bash
# MagicPod batch-run を API で開始し、完了後に JUnit XML へ変換する。
# 環境変数: MAGICPOD_API_TOKEN, MAGICPOD_ORGANIZATION, MAGICPOD_PROJECT,
#           MAGICPOD_SETTING_NUMBER
set -euo pipefail

API="https://app.magicpod.com/api/v1.0/${MAGICPOD_ORGANIZATION}/${MAGICPOD_PROJECT}"
AUTH="Authorization: Token ${MAGICPOD_API_TOKEN}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p test-results/magicpod

magicpod_api() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local tmp
  tmp="$(mktemp)"
  local http_code

  if [ -n "${body}" ]; then
    http_code=$(curl -sS -w "%{http_code}" -o "${tmp}" -X "${method}" \
      "${API}${path}" -H "${AUTH}" -H "Content-Type: application/json" -d "${body}")
  else
    http_code=$(curl -sS -w "%{http_code}" -o "${tmp}" -X "${method}" \
      "${API}${path}" -H "${AUTH}")
  fi

  if [ "${http_code}" -lt 200 ] || [ "${http_code}" -ge 300 ]; then
    echo "MagicPod API error: ${method} ${path} returned HTTP ${http_code}"
    cat "${tmp}"
    rm -f "${tmp}"
    exit 1
  fi

  cat "${tmp}"
  rm -f "${tmp}"
}

# -S (test_settings_number) 指定時は CLI と同様 cross-batch-run を使う
START_BODY="{\"test_settings_number\": ${MAGICPOD_SETTING_NUMBER}}"
START_RESPONSE=$(magicpod_api POST "/cross-batch-run/" "${START_BODY}")

BATCH_RUN_NO=$(echo "${START_RESPONSE}" | jq -r '.batch_run_number')
if [ -z "${BATCH_RUN_NO}" ] || [ "${BATCH_RUN_NO}" = "null" ]; then
  echo "Failed to start batch-run (no batch_run_number in response):"
  echo "${START_RESPONSE}"
  exit 1
fi
echo "batch_run_number: ${BATCH_RUN_NO}"

while :; do
  BODY=$(magicpod_api GET "/batch-run/${BATCH_RUN_NO}/")
  STATUS=$(echo "${BODY}" | jq -r '.status')
  [ "${STATUS}" != "running" ] && break
  sleep 30
done

echo "${BODY}" > test-results/magicpod/batch_run_result.json

python3 "${REPO_ROOT}/scripts/magicpod_to_junit.py" \
  test-results/magicpod/batch_run_result.json \
  test-results/magicpod/results.xml

[ "${STATUS}" = "succeeded" ] || [ "${STATUS}" = "unresolved" ] || exit 1

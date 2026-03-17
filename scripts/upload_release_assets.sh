#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-Ajianplus/teleai}"
TAG="${TAG:-media-assets-20260316}"
RELEASE_NAME="${RELEASE_NAME:-Media assets 2026-03-16}"
ASSET_DIR="${ASSET_DIR:-.media-release-assets}"

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl not found in PATH." >&2
  exit 1
fi

if ! command -v ruby >/dev/null 2>&1; then
  echo "ERROR: ruby not found in PATH." >&2
  exit 1
fi

if [[ ! -d "$ASSET_DIR" ]]; then
  echo "ERROR: asset directory not found: $ASSET_DIR" >&2
  exit 1
fi

credential_payload="$(printf 'protocol=https\nhost=github.com\n\n' | git credential fill)"
github_user="$(printf '%s\n' "$credential_payload" | sed -n 's/^username=//p')"
github_pass="$(printf '%s\n' "$credential_payload" | sed -n 's/^password=//p')"

if [[ -z "$github_user" || -z "$github_pass" ]]; then
  echo "ERROR: GitHub credentials were not available from git credential helper." >&2
  exit 1
fi

api_get() {
  local url="$1"
  curl -fsSL -u "$github_user:$github_pass" \
    -H "Accept: application/vnd.github+json" \
    "$url"
}

api_post_json() {
  local url="$1"
  local body="$2"
  curl -fsSL -u "$github_user:$github_pass" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    -X POST \
    -d "$body" \
    "$url"
}

upload_asset() {
  local release_id="$1"
  local file_path="$2"
  local asset_name="$3"
  local encoded_name
  encoded_name="$(ruby -ruri -e 'puts URI.encode_www_form_component(ARGV[0])' "$asset_name")"

  curl -fsSL -u "$github_user:$github_pass" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"$file_path" \
    "https://uploads.github.com/repos/$REPO/releases/$release_id/assets?name=$encoded_name" \
    >/dev/null
}

extract_json_field() {
  local json="$1"
  local field="$2"
  ruby -rjson -e 'obj = JSON.parse(STDIN.read); value = obj.fetch(ARGV[0], nil); puts(value.is_a?(String) || value.is_a?(Numeric) ? value : "")' "$field" <<<"$json"
}

release_has_asset() {
  local json="$1"
  local asset_name="$2"
  ruby -rjson -e '
    release = JSON.parse(STDIN.read)
    exists = Array(release["assets"]).any? { |asset| asset["name"] == ARGV[0] }
    exit(exists ? 0 : 1)
  ' "$asset_name" <<<"$json"
}

release_json="$(api_get "https://api.github.com/repos/$REPO/releases/tags/$TAG" 2>/dev/null || true)"
if [[ -z "$release_json" ]]; then
  create_body="$(ruby -rjson -e 'puts JSON.generate({"tag_name" => ARGV[0], "name" => ARGV[1], "draft" => false, "prerelease" => false})' "$TAG" "$RELEASE_NAME")"
  release_json="$(api_post_json "https://api.github.com/repos/$REPO/releases" "$create_body")"
fi

release_id="$(extract_json_field "$release_json" id)"
if [[ -z "$release_id" ]]; then
  echo "ERROR: could not resolve GitHub release id for tag $TAG." >&2
  exit 1
fi

declare -a asset_map=(
  "assets/publication/空海跨域具身智能体-0309-小.mp4|publication-air-sea-cross-domain-agent-0309-small.mp4"
  "assets/publication/空海跨域具身智能体-0309-小-web.mp4|publication-air-sea-cross-domain-agent-0309-small-web.mp4"
  "assets/publication/深海相机+机械臂demo20260211.mp4|publication-underwater-camera-arm-demo-20260211.mp4"
  "assets/publication/深海相机+机械臂demo20260211.mov|publication-underwater-camera-arm-demo-20260211.mov"
  "assets/publication/深海相机+机械臂demo20260211-web.mp4|publication-underwater-camera-arm-demo-20260211-web.mp4"
  "assets/reports/cctv_走遍中国720P-20240606.mp4|report-cctv-zoubianzhongguo-20240606.mp4"
  "assets/reports/cctv_走遍中国720P-20240606__low.mp4|report-cctv-zoubianzhongguo-20240606-low.mp4"
  "assets/reports/《解码科技史》 20240413 读懂你的脑电波.mp4|report-decode-tech-history-20240413.mp4"
  "assets/reports/《解码科技史》 20240413 读懂你的脑电波__low.mp4|report-decode-tech-history-20240413-low.mp4"
  "assets/reports/央视13新闻1+1报道(原视频)-20240327.mp4|report-news1plus1-20240327.mp4"
  "assets/reports/央视CGTN年度系列纪录片《澎湃中国》讲述我校师生的奋斗故事-西北工业大学-20240920.mp4|report-pengpai-china-20240920.mp4"
  "assets/reports/央视CGTN年度系列纪录片《澎湃中国》讲述我校师生的奋斗故事-西北工业大学-20240920__low.mp4|report-pengpai-china-20240920-low.mp4"
)

for mapping in "${asset_map[@]}"; do
  local_path="${mapping%%|*}"
  asset_name="${mapping##*|}"
  staged_path="$ASSET_DIR/$local_path"
  source_path="$staged_path"

  if [[ ! -f "$source_path" ]]; then
    source_path="$local_path"
  fi

  if [[ ! -f "$source_path" ]]; then
    echo "ERROR: asset not found in staging or workspace: $local_path" >&2
    exit 1
  fi

  if release_has_asset "$release_json" "$asset_name"; then
    echo "Skipping existing asset $asset_name"
    continue
  fi

  echo "Uploading $asset_name"
  upload_asset "$release_id" "$source_path" "$asset_name"
done

echo "Release assets uploaded to tag $TAG."

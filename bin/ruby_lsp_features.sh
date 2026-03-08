#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage: ./bin/ruby_lsp_features.sh <enable|disable|status>

This toggles Ruby LSP workspace settings in .vscode/settings.json.
After changing settings, run "Developer: Reload Window" in VS Code.
USAGE
}

CMD="${1-}"
if [[ -z "${CMD}" ]]; then
  usage
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SETTINGS_FILE="${ROOT_DIR}/.vscode/settings.json"

python3 - "${CMD}" "${SETTINGS_FILE}" <<'PY'
import json
import sys
from pathlib import Path

cmd = sys.argv[1]
path = Path(sys.argv[2])

FEATURE_KEYS = [
    "codeActions",
    "diagnostics",
    "documentHighlights",
    "documentLink",
    "documentSymbols",
    "foldingRanges",
    "formatting",
    "hover",
    "inlayHint",
    "onTypeFormatting",
    "selectionRanges",
    "semanticHighlighting",
    "completion",
    "codeLens",
    "definition",
    "workspaceSymbol",
    "signatureHelp",
    "typeHierarchy",
]


def load_settings() -> dict:
    if not path.exists():
        return {}
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    if not isinstance(data, dict):
        raise SystemExit(f"{path} must contain a JSON object at top-level")
    return data


def save_settings(data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def set_features(data: dict, enabled: bool) -> None:
    feats = data.get("rubyLsp.enabledFeatures")
    if not isinstance(feats, dict):
        feats = {}
    for key in FEATURE_KEYS:
        feats[key] = enabled
    data["rubyLsp.enabledFeatures"] = feats


def is_bool(v) -> bool:
    return v is True or v is False


def status(data: dict) -> int:
    feats = data.get("rubyLsp.enabledFeatures")
    if not isinstance(feats, dict):
        print(f"{path}: rubyLsp.enabledFeatures not set")
        return 1

    values = [feats.get(k) for k in FEATURE_KEYS]
    true_count = sum(1 for v in values if v is True)
    false_count = sum(1 for v in values if v is False)
    other_count = len(values) - true_count - false_count

    erb = data.get("rubyLsp.erbSupport")
    fmt = data.get("rubyLsp.formatter")

    if false_count == len(FEATURE_KEYS):
        mode = "disabled"
    elif true_count == len(FEATURE_KEYS):
        mode = "enabled"
    else:
        mode = "mixed"

    print(f"{path}: {mode} (features true={true_count} false={false_count} other={other_count}, erb={erb!r}, formatter={fmt!r})")
    return 0 if mode != "mixed" else 1


if cmd == "status":
    raise SystemExit(status(load_settings()))

if cmd == "enable":
    data = load_settings()
    set_features(data, True)
    data["rubyLsp.erbSupport"] = True
    data["rubyLsp.formatter"] = "auto"
    # Let the extension decide default linters unless explicitly set.
    data.pop("rubyLsp.linters", None)
    save_settings(data)
    print("Ruby LSP settings: enabled. Reload VS Code window to apply.")
    raise SystemExit(0)

if cmd == "disable":
    data = load_settings()
    set_features(data, False)
    data["rubyLsp.erbSupport"] = False
    data["rubyLsp.formatter"] = "none"
    data["rubyLsp.linters"] = []
    data["rubyLsp.pullDiagnosticsOn"] = "save"
    save_settings(data)
    print("Ruby LSP settings: disabled. Reload VS Code window to apply.")
    raise SystemExit(0)

print("Unknown command:", cmd, file=sys.stderr)
print("Expected: enable | disable | status", file=sys.stderr)
raise SystemExit(2)
PY


#!/usr/bin/env bash
set -euo pipefail

# Stabilize Ruby LSP startup: prevent composed bundle auto-updates from running
# on attach (which can cause noisy popups if dependency resolution fails).
./bin/ruby_lsp_bootstrap.sh

exec ./bin/entry_point.sh

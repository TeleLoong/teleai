#!/usr/bin/env bash
set -euo pipefail

# Prevent Shopify Ruby LSP from automatically running `bundle update` for the
# composed bundle (which can be flaky/noisy in this workspace).
#
# Safe to run multiple times.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUBY_LSP_DIR="${ROOT_DIR}/.ruby-lsp"

mkdir -p "${RUBY_LSP_DIR}"

# Ensure generated Ruby LSP files stay out of git even if the parent repo forgets.
if [[ ! -f "${RUBY_LSP_DIR}/.gitignore" ]]; then
  printf '*\n' > "${RUBY_LSP_DIR}/.gitignore"
fi

# Ruby LSP decides whether to auto-update the composed bundle based on this
# timestamp (it updates if it's older than 4 hours). Use a far future time.
printf '2999-01-01T00:00:00Z\n' > "${RUBY_LSP_DIR}/last_updated"

# These files can force update flows or reuse a broken state.
rm -f \
  "${RUBY_LSP_DIR}/needs_update" \
  "${RUBY_LSP_DIR}/install_error" \
  "${RUBY_LSP_DIR}/bundle_env" \
  "${RUBY_LSP_DIR}/bundle_is_composed" \
  "${RUBY_LSP_DIR}/raw_initialize"


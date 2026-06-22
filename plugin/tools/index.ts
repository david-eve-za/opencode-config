// Tool registry - imports and registers all tools

// Core tools
import { register as findExports } from "./core/find-exports"
import { register as pkgScripts } from "./core/pkg-scripts"
import { register as ubs } from "./core/ubs"
import { register as cass } from "./core/cass"
import { register as repoAutopsy } from "./core/repo-autopsy"
import { register as pdfBrain } from "./core/pdf-brain"
import { register as gitContext } from "./core/git-context"
import { register as repoCrawl } from "./core/repo-crawl"
import { register as typecheck } from "./core/typecheck"

// Language tools
import { register as goVet } from "./language/go/go-vet"
import { register as goTest } from "./language/go/go-test"
import { register as goMod } from "./language/go/go-mod"
import { register as cargoCheck } from "./language/rust/cargo-check"
import { register as cargoClippy } from "./language/rust/cargo-clippy"
import { register as cargoTest } from "./language/rust/cargo-test"
import { register as ruffCheck } from "./language/python/ruff-check"
import { register as pytestRun } from "./language/python/pytest-run"
import { register as pipList } from "./language/python/pip-list"

// Infra tools
import { register as dockerLint } from "./infra/docker-lint"
import { register as k8sValidate } from "./infra/k8s-validate"
import { register as tfPlan } from "./infra/tf-plan"
import { register as ciStatus } from "./infra/ci-status"

// Data tools
import { register as dbSchema } from "./data/db-schema"
import { register as dbQuery } from "./data/db-query"
import { register as migrationCheck } from "./data/migration-check"

// Deprecated
import { register as bdQuick } from "./deprecated/bd-quick"

export function registerTools(api: any) {
  // Core
  findExports(api)
  pkgScripts(api)
  ubs(api)
  cass(api)
  repoAutopsy(api)
  pdfBrain(api)
  gitContext(api)
  repoCrawl(api)
  typecheck(api)

  // Language
  goVet(api)
  goTest(api)
  goMod(api)
  cargoCheck(api)
  cargoClippy(api)
  cargoTest(api)
  ruffCheck(api)
  pytestRun(api)
  pipList(api)

  // Infra
  dockerLint(api)
  k8sValidate(api)
  tfPlan(api)
  ciStatus(api)

  // Data
  dbSchema(api)
  dbQuery(api)
  migrationCheck(api)

  // Deprecated (kept for backward compatibility)
  bdQuick(api)
}

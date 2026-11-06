package validations

import "embed"

// RuleSources holds a read-only copy of the selected Go source files inside the binary.
//
//  1. At build time, go:embed copies registry-rules.go and the check files below
//     into this filesystem. Changing those files requires rebuilding the binary.
//
//  2. When loading rules.json, ValidateRulesJSON passes this filesystem to
//     DiscoverRuleIDs, which reads RuleChecks registrations to find known rule IDs.
//     Configuration validation uses those IDs to reject unknown rules and dependencies.
//
//  3. Embedding lets that source discovery work when only the compiled binary is
//     deployed, without requiring a copy of the repository on the target machine.
//
// The patterns are relative to this package, so the declaration stays beside
// registry-rules.go and the check folders.
//
//go:embed registry-rules.go */checks/*.go
var RuleSources embed.FS

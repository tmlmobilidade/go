package validations_types

import contextTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"

// Check executes one complete rule. Each implementation selects its tables and fields.
type Check func(*contextTypes.ValidationContext) error

// RuleChecks maps rule IDs to the validation functions registered in one batch.
type RuleChecks map[string]Check

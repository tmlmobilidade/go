package validations_types

import contextTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"

// Check executes one complete rule. Each implementation selects its tables and fields.
type Check func(*contextTypes.ValidationContext) error

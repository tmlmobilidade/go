package variables

import (
	"sync"

	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
)

// RegisteredRules holds the callbacks shared by validation runs.
// Readers and writers must hold the embedded lock when accessing Checks.
var RegisteredRules = struct {
	sync.RWMutex
	Checks map[string]validationTypes.Check
}{Checks: make(map[string]validationTypes.Check)}

// RegisterRulesOnce ensures the central registrations are applied only once.
var RegisterRulesOnce sync.Once

package fare_rules_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/utils"
	"testing"
)

func TestFareIdField(t *testing.T) { testutils.CheckPresence(t, "fare_id", checks.FareIdField) }

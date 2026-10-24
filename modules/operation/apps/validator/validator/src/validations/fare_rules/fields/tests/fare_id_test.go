package fare_rules_fields_test

import (
	checks "main/validations/fare_rules/fields/checks"
	testutils "main/validations/fare_rules/utils"
	"testing"
)

func TestFareIdField(t *testing.T) { testutils.CheckPresence(t, "fare_id", checks.FareIdField) }

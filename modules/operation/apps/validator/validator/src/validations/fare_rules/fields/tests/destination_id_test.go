package fare_rules_fields_test

import (
	checks "main/validations/fare_rules/fields/checks"
	testutils "main/validations/fare_rules/utils"
	"testing"
)

func TestDestinationIdField(t *testing.T) {
	testutils.CheckPresence(t, "destination_id", checks.DestinationIdField)
}

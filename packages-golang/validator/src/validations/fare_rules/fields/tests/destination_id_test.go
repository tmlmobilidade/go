package fare_rules_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fare_rules/utils"
	"testing"
)

func TestDestinationIdField(t *testing.T) {
	testutils.CheckPresence(t, "destination_id", checks.DestinationIdField)
}

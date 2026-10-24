package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestModelField(t *testing.T) { testutils.CheckPresence(t, "model", checks.ModelField) }

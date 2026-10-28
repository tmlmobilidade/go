package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestEmissionField(t *testing.T) { testutils.CheckPresence(t, "emission", checks.EmissionField) }

package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestAgencyIdField(t *testing.T) { testutils.CheckPresence(t, "agency_id", checks.AgencyIdField) }

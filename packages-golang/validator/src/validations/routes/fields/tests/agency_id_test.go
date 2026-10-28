package routes_fields_test

import (
	checks "main/validations/routes/fields/checks"
	testutils "main/validations/routes/utils"
	"testing"
)

func TestAgencyIdField(t *testing.T) { testutils.CheckPresence(t, "agency_id", checks.AgencyIdField) }

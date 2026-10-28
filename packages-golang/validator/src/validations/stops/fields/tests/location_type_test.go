package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestLocationTypeField(t *testing.T) {
	testutils.CheckPresence(t, "location_type", checks.LocationTypeField, 1)
}

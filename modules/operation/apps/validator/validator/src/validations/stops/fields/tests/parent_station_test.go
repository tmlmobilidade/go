package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestParentStationField(t *testing.T) {
	testutils.CheckPresence(t, "parent_station", checks.ParentStationField, 1)
}

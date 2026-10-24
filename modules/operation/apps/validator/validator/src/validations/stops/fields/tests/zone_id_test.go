package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestZoneIdField(t *testing.T) {
	testutils.CheckPresence(t, "zone_id", checks.ZoneIdField, 0)
}

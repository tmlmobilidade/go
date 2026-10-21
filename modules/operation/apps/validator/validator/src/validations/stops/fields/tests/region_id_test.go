package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestRegionIdField(t *testing.T) {
	testutils.CheckPresence(t, "region_id", checks.RegionIdField, 1)
}

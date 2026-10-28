package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestParentStationField(t *testing.T) {
	testutils.CheckPresence(t, "parent_station", checks.ParentStationField, 1)
}

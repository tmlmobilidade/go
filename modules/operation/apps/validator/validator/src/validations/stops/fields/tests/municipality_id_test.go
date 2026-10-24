package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestMunicipalityIdField(t *testing.T) {
	testutils.CheckPresence(t, "municipality_id", checks.MunicipalityIdField, 1)
}

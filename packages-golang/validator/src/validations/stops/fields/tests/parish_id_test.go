package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestParishIdField(t *testing.T) {
	testutils.CheckPresence(t, "parish_id", checks.ParishIdField, 1)
}

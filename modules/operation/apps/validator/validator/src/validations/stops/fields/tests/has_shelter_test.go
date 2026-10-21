package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasShelterField(t *testing.T) {
	testutils.CheckPresence(t, "has_shelter", checks.HasShelterField, 1)
}

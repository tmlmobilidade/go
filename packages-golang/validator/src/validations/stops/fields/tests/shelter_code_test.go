package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestShelterCodeField(t *testing.T) {
	testutils.CheckPresence(t, "shelter_code", checks.ShelterCodeField, 1)
}

package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestShelterMaintainerField(t *testing.T) {
	testutils.CheckPresence(t, "shelter_maintainer", checks.ShelterMaintainerField, 1)
}

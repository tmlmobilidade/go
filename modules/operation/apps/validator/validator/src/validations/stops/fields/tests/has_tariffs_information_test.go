package stops_fields_test

import (
	checks "main/validations/stops/fields/checks"
	testutils "main/validations/stops/utils"
	"testing"
)

func TestHasTariffsInformationField(t *testing.T) {
	testutils.CheckPresence(t, "has_tariffs_information", checks.HasTariffsInformationField, 1)
}

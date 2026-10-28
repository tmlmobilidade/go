package stops_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stops/utils"
	"testing"
)

func TestHasTariffsInformationField(t *testing.T) {
	testutils.CheckPresence(t, "has_tariffs_information", checks.HasTariffsInformationField, 1)
}

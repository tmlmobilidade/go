package vehicles_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"testing"
)

func TestLicensePlateField(t *testing.T) {
	testutils.CheckPresence(t, "license_plate", checks.LicensePlateField)
}

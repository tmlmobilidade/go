package vehicles_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/vehicles/utils"
	"testing"
)

func TestRegistrationDateField(t *testing.T) {
	testutils.CheckPresence(t, "registration_date", checks.RegistrationDateField)
}

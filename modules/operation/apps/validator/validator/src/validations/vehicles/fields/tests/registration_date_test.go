package vehicles_fields_test

import (
	checks "main/validations/vehicles/fields/checks"
	testutils "main/validations/vehicles/utils"
	"testing"
)

func TestRegistrationDateField(t *testing.T) {
	testutils.CheckPresence(t, "registration_date", checks.RegistrationDateField)
}

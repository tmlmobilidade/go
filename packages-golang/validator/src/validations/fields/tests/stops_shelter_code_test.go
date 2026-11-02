package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShelterCodeField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "shelter_code", fields.ShelterCodeField, 1)
}

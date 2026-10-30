package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestShelterMaintainerField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "shelter_maintainer", fields.ShelterMaintainerField, 1)
}

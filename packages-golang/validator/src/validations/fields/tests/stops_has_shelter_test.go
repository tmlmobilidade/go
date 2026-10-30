package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasShelterField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "has_shelter", fields.HasShelterField, 1)
}

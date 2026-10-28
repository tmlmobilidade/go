package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLocationTypeField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "location_type", fields.LocationTypeField, 1)
}

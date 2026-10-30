package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestBikesAllowedField(t *testing.T) {
	validationutils.TripsCheckPresence(t, "bikes_allowed", fields.BikesAllowedField)
}

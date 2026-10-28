package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestDepartureTimeField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "departure_time", fields.DepartureTimeField)
}

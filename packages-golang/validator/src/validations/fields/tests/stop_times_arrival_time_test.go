package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestArrivalTimeField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "arrival_time", fields.ArrivalTimeField)
}

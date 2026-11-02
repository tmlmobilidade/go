package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopTimesStopIdField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "stop_id", fields.StopTimesStopIdField)
}

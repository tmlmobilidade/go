package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopNameField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "stop_name", fields.StopNameField, 1)
}

package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopCodeField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "stop_code", fields.StopCodeField, 1)
}

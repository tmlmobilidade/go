package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopDescField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "stop_desc", fields.StopDescField, 1)
}

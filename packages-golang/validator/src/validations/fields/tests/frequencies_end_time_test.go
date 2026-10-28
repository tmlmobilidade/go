package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestEndTimeField(t *testing.T) {
	validationutils.FrequenciesCheckPresence(t, "end_time", fields.EndTimeField)
}

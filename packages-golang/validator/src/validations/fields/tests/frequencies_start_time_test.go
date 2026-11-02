package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStartTimeField(t *testing.T) {
	validationutils.FrequenciesCheckPresence(t, "start_time", fields.StartTimeField)
}

package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestExactTimesField(t *testing.T) {
	validationutils.FrequenciesCheckPresence(t, "exact_times", fields.ExactTimesField)
}

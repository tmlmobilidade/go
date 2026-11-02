package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestTimepointField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "timepoint", fields.TimepointField)
}

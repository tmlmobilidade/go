package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestStopTimesContinuousDropOffField(t *testing.T) {
	validationutils.StopTimesCheckPresence(t, "continuous_drop_off", fields.StopTimesContinuousDropOffField)
}

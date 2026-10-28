package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasSchedulesField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "has_schedules", fields.HasSchedulesField, 1)
}

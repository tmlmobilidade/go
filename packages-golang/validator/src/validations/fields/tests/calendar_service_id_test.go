package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestServiceIdValidation(t *testing.T) {
	validationutils.CalendarCheckPresence(t, "service_id", fields.ServiceIdValidation)
}

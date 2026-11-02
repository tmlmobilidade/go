package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHasStopSignField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "has_stop_sign", fields.HasStopSignField, 1)
}

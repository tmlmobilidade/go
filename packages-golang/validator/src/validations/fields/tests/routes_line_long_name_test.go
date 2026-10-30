package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLineLongNameField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "line_long_name", fields.LineLongNameField)
}

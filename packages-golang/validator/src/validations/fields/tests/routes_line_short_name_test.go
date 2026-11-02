package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestLineShortNameField(t *testing.T) {
	validationutils.RoutesCheckPresence(t, "line_short_name", fields.LineShortNameField)
}

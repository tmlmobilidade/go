package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestMinWidthField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "min_width", fields.MinWidthField)
}

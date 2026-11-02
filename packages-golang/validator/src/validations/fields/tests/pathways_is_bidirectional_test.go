package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestIsBidirectionalField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "is_bidirectional", fields.IsBidirectionalField)
}

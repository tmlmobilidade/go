package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestPublicVisibleField(t *testing.T) {
	validationutils.StopsCheckPresence(t, "public_visible", fields.PublicVisibleField, 1)
}

package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestModelField(t *testing.T) {
	validationutils.VehiclesCheckPresence(t, "model", fields.ModelField)
}

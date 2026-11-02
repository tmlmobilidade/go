package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestEmissionField(t *testing.T) {
	validationutils.VehiclesCheckPresence(t, "emission", fields.EmissionField)
}

package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestCarCapacityField(t *testing.T) {
	validationutils.VehiclesCheckPresence(t, "car_capacity", fields.CarCapacityField)
}

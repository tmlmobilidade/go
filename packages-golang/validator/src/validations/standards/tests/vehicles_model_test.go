package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestVehiclesModel(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_model_field",
		table: "vehicles",
		field: "model",
		run:   standard.ModelField,
	})
}

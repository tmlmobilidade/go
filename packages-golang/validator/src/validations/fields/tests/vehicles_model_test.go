package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestModelField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_model_field",
		table: "vehicles",
		field: "model",
		run:   fields.ModelField,
	})
}

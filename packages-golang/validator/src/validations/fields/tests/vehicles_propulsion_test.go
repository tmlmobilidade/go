package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestPropulsionField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_propulsion_field",
		table: "vehicles",
		field: "propulsion",
		run:   fields.PropulsionField,
	})
}

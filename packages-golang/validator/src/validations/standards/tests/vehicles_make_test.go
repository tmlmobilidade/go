package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestVehiclesMake(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "vehicles_make_field",
		table: "vehicles",
		field: "make",
		run:   standard.MakeField,
	})
}

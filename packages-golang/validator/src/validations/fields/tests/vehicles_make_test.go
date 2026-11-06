package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestMakeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "vehicles_make_field",
		table: "vehicles",
		field: "make",
		run:   fields.MakeField,
	})
}

package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLineLongNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_line_long_name_field",
		table: "routes",
		field: "line_long_name",
		run:   fields.LineLongNameField,
	})
}

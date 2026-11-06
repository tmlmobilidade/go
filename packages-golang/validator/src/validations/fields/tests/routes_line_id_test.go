package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestLineIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_line_id_field",
		table: "routes",
		field: "line_id",
		run:   fields.LineIdField,
	})
}

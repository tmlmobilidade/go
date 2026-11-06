package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestLineShortNameField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_line_short_name_field",
		table: "routes",
		field: "line_short_name",
		run:   fields.LineShortNameField,
	})
}

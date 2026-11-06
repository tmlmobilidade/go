package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestRoutesLineLongName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_line_long_name_field",
		table: "routes",
		field: "line_long_name",
		run:   standard.LineLongNameField,
	})
}

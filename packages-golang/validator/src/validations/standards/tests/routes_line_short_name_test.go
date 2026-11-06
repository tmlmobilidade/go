package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesLineShortName(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_line_short_name_field",
		table: "routes",
		field: "line_short_name",
		run:   standard.LineShortNameField,
	})
}

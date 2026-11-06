package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesLineId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_line_id_field",
		table: "routes",
		field: "line_id",
		run:   standard.LineIdField,
	})
}

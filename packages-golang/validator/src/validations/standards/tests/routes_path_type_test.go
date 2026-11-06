package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestRoutesPathType(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "routes_path_type_field",
		table: "routes",
		field: "path_type",
		run:   standard.PathTypeField,
	})
}

package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPathTypeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "routes_path_type_field",
		table: "routes",
		field: "path_type",
		run:   fields.PathTypeField,
	})
}

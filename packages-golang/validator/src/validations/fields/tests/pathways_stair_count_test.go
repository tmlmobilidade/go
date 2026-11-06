package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestStairCountField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_stair_count_field",
		table: "pathways",
		field: "stair_count",
		run:   fields.StairCountField,
	})
}

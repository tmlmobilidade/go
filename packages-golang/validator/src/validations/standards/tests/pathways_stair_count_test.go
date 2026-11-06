package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestPathwaysStairCount(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_stair_count_field",
		table: "pathways",
		field: "stair_count",
		run:   standard.StairCountField,
	})
}

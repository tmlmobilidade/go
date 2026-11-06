package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPathwayModeField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_pathway_mode_field",
		table: "pathways",
		field: "pathway_mode",
		run:   fields.PathwayModeField,
	})
}

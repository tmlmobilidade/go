package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPathwayIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_pathway_id_field",
		table: "pathways",
		field: "pathway_id",
		run:   fields.PathwayIdField,
	})
}

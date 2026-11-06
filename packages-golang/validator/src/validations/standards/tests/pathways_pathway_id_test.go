package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysPathwayId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_pathway_id_field",
		table: "pathways",
		field: "pathway_id",
		run:   standard.PathwayIdField,
	})
}

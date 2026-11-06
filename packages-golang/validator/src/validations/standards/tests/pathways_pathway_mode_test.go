package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysPathwayMode(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_pathway_mode_field",
		table: "pathways",
		field: "pathway_mode",
		run:   standard.PathwayModeField,
	})
}

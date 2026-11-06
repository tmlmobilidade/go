package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysFromStopId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_from_stop_id_field",
		table: "pathways",
		field: "from_stop_id",
		run:   standard.PathwaysFromStopIdField,
	})
}

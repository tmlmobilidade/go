package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestPathwaysToStopId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "pathways_to_stop_id_field",
		table: "pathways",
		field: "to_stop_id",
		run:   standard.PathwaysToStopIdField,
	})
}

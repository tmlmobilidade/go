package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestPathwaysFromStopIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_from_stop_id_field",
		table: "pathways",
		field: "from_stop_id",
		run:   fields.PathwaysFromStopIdField,
	})
}

package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
)

func TestPathwaysToStopIdField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "pathways_to_stop_id_field",
		table: "pathways",
		field: "to_stop_id",
		run:   fields.PathwaysToStopIdField,
	})
}

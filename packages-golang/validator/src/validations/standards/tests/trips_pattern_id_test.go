package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

func TestTripsPatternId(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "trips_pattern_id_field",
		table: "trips",
		field: "pattern_id",
		run:   standard.PatternIdField,
	})
}

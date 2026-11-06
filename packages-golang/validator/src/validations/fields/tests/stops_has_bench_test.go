package fields_test

import (
	"testing"

	fields "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/fields/checks"
)

func TestHasBenchField(t *testing.T) {
	checkPresence(t, fieldCheck{
		id:    "stops_has_bench_field",
		table: "stops",
		field: "has_bench",
		run:   fields.HasBenchField,
	})
}

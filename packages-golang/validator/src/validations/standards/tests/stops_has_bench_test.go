package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsHasBench(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_bench_field",
		table: "stops",
		field: "has_bench",
		run:   standard.HasBenchField,
	})
}

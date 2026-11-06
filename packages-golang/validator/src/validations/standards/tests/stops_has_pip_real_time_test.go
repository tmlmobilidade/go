package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestStopsHasPipRealTime(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "stops_has_pip_real_time_field",
		table: "stops",
		field: "has_pip_real_time",
		run:   standard.HasPipRealTimeField,
	})
}

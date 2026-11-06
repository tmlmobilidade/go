package standard_test

import (
	"testing"

	standard "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/standards/checks"
)

func TestFrequenciesExactTimes(t *testing.T) {
	checkPresence(t, standardCheck{
		id:    "frequencies_exact_times_field",
		table: "frequencies",
		field: "exact_times",
		run:   standard.ExactTimesField,
	})
}

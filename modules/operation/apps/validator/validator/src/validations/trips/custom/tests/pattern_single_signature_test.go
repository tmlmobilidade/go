package trips_custom_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestPatternSingleSignature(t *testing.T) {
	runCases(t, "trips_pattern_single_signature", "pattern_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.PatternSingleSignature(db, rules, map[int]string{3: "first", 4: "second"})
	}, []scenario{
		{name: "One"}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; ", count: 1},
	})
}

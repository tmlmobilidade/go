package trips_custom_test

import (
	"main/services"
	"main/types"
	checks "main/validations/trips/custom/checks"
	"testing"
)

func TestOnePatternPerShape(t *testing.T) {
	runCases(t, "trips_one_pattern_id_per_shape_id_group", "shape_id", "trips.txt", func(db *services.SQLiteContext, rules *types.RuleContext) error {
		return checks.OnePatternPerShape(db, rules, map[[2]string]bool{})
	}, []scenario{
		{name: "One"}, {name: "Mismatch", sql: "INSERT INTO trips SELECT * FROM trips WHERE rowid=4; UPDATE trips SET pattern_id='other' WHERE rowid=5", count: 1},
	})
}

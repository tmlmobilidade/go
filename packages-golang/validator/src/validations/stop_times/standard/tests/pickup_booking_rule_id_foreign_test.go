package stop_times_standard_test

import (
	"database/sql"
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/standard/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/stop_times/utils"
	"testing"
)

func TestPickupBookingRuleIdForeign(t *testing.T) {
	const id = "stop_times_pickup_booking_rule_id_foreign"
	setup := func(db *sql.DB) {
		if _, err := db.Exec("CREATE TABLE booking_rules (booking_rule_id TEXT)"); err != nil {
			t.Fatal(err)
		}
		for _, value := range []string{"found", "O'Brien"} {
			if _, err := db.Exec("INSERT INTO booking_rules VALUES (?)", value); err != nil {
				t.Fatal(err)
			}
		}
	}
	testutils.CheckCases(t, id, "pickup_booking_rule_id", checks.PickupBookingRuleIdForeign, []testutils.Case{
		{Name: "Found", Values: map[string]any{"pickup_booking_rule_id": "found"}},
		{Name: "QuotedID", Values: map[string]any{"pickup_booking_rule_id": "O'Brien"}},
		{Name: "MissingID", Values: map[string]any{"pickup_booking_rule_id": "absent"}, Count: 1},
		{Name: "CaseSensitive", Values: map[string]any{"pickup_booking_rule_id": "FOUND"}, Count: 1},
		{Name: "SQLIsLiteral", Values: map[string]any{"pickup_booking_rule_id": "' OR 1=1 --"}, Count: 1},
		{Name: "Empty", Values: map[string]any{"pickup_booking_rule_id": ""}, Count: 1},
		{Name: "Null", Values: map[string]any{"pickup_booking_rule_id": nil}, Count: 1},
		{Name: "MissingColumn", Values: map[string]any{}, Count: 1},
	}, setup)
	t.Run("MissingReferenceTable", func(t *testing.T) {
		testutils.CheckCases(t, id, "pickup_booking_rule_id", checks.PickupBookingRuleIdForeign, []testutils.Case{
			{Name: "Missing", Values: map[string]any{"pickup_booking_rule_id": "found"}, Count: 1},
		})
	})
}

package transfers_fields_test

import (
	"main/types"
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestToTripIdField(t *testing.T) { testutils.CheckPresence(t, "to_trip_id", checks.ToTripIdField) }
func TestToTripIdFieldInSeatTypes(t *testing.T) {
	const id = "transfers_to_trip_id_field"
	for _, kind := range []string{"4", "5", "04"} {
		t.Run(kind, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"to_trip_id": nil, "transfer_type": kind}, config)
			if err := checks.ToTripIdField(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_trip_id", types.SEVERITY_ERROR, 1)
		})
	}
}

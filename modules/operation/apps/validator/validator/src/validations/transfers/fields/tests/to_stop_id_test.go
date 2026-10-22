package transfers_fields_test

import (
	"main/types"
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestToStopIdField(t *testing.T) { testutils.CheckPresence(t, "to_stop_id", checks.ToStopIdField) }
func TestToStopIdFieldTransferTypes(t *testing.T) {
	const id = "transfers_to_stop_id_field"
	for _, tc := range []struct {
		kind  string
		count int
	}{{"0", 0}, {"1", 1}, {"2", 1}, {"3", 1}, {"4", 0}, {"5", 0}, {"04", 0}, {"", 0}, {"bad", 0}} {
		t.Run(tc.kind, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"to_stop_id": "", "transfer_type": tc.kind}, config)
			if err := checks.ToStopIdField(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}

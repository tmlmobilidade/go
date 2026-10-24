package transfers_fields_test

import (
	"main/types"
	checks "main/validations/transfers/fields/checks"
	testutils "main/validations/transfers/utils"
	"testing"
)

func TestFromStopIdField(t *testing.T) {
	testutils.CheckPresence(t, "from_stop_id", checks.FromStopIdField)
}
func TestFromStopIdFieldTransferTypes(t *testing.T) {
	const id = "transfers_from_stop_id_field"
	for _, tc := range []struct {
		kind  string
		count int
	}{{"0", 0}, {"1", 1}, {"2", 1}, {"3", 1}, {"4", 0}, {"5", 0}, {"04", 0}, {"", 0}, {"bad", 0}} {
		t.Run(tc.kind, func(t *testing.T) {
			config := testutils.Config(id, types.SEVERITY_ERROR)
			_, ctx := testutils.Fixture(t, map[string]any{"from_stop_id": "", "transfer_type": tc.kind}, config)
			if err := checks.FromStopIdField(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			testutils.AssertFindings(t, id, "from_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}

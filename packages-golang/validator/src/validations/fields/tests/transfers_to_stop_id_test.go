package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTransfersToStopIdField(t *testing.T) {
	validationutils.TransfersCheckPresence(t, "to_stop_id", fields.TransfersToStopIdField)
}
func TestToStopIdFieldTransferTypes(t *testing.T) {
	const id = "transfers_to_stop_id_field"
	for _, tc := range []struct {
		kind  string
		count int
	}{{"0", 0}, {"1", 1}, {"2", 1}, {"3", 1}, {"4", 0}, {"5", 0}, {"04", 0}, {"", 0}, {"bad", 0}} {
		t.Run(tc.kind, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, map[string]any{"to_stop_id": "", "transfer_type": tc.kind}, config)
			if err := fields.TransfersToStopIdField(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "to_stop_id", types.SEVERITY_ERROR, tc.count)
		})
	}
}

package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestTransferTypeValid(t *testing.T) {
	const id = "transfers_transfer_type_valid"
	for _, tc := range []struct {
		name   string
		values map[string]any
		count  int
	}{
		{"0", map[string]any{"transfer_type": "0"}, 0},
		{"1", map[string]any{"transfer_type": "1"}, 0},
		{"2", map[string]any{"transfer_type": "2"}, 0},
		{"3", map[string]any{"transfer_type": "3"}, 0},
		{"4", map[string]any{"transfer_type": "4"}, 0},
		{"5", map[string]any{"transfer_type": "5"}, 0},
		{"01", map[string]any{"transfer_type": "01"}, 0},
		{"", map[string]any{"transfer_type": ""}, 0},
		{"None", map[string]any{"transfer_type": nil}, 0},
		{"-1", map[string]any{"transfer_type": "-1"}, 1},
		{"6", map[string]any{"transfer_type": "6"}, 1},
		{"bad", map[string]any{"transfer_type": "bad"}, 1},
		{"1.5", map[string]any{"transfer_type": "1.5"}, 1},
		{"999999999999999999999999", map[string]any{"transfer_type": "999999999999999999999999"}, 1},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			_, ctx := validationutils.TransfersFixture(t, tc.values, config)
			if err := standard.TransferTypeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "transfer_type", types.SEVERITY_ERROR, tc.count)
		})
	}
	validationutils.TransfersCheckInvalid(t, id, "transfer_type", standard.TransferTypeValid, map[string]any{"transfer_type": "missing"})
}
func TestTransferTypeOptions(t *testing.T) {
	const id = "transfers_transfer_type_valid"
	for _, tc := range []struct {
		name    string
		options []string
		count   int
	}{{"Allowed", []string{"2"}, 0}, {"Rejected", []string{"1"}, 1}, {"All", []string{types.ALL_OPTIONS}, 0}, {"Empty", []string{}, 1}} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.TransfersConfig(id, types.SEVERITY_ERROR)
			config.SetRule(id, types.RuleContext{Severity: types.SEVERITY_ERROR, Options: &tc.options})
			_, ctx := validationutils.TransfersFixture(t, map[string]any{"transfer_type": "02"}, config)
			if err := standard.TransferTypeValid(ctx, config.Rule(id)); err != nil {
				t.Fatal(err)
			}
			validationutils.TransfersAssertFindings(t, id, "transfer_type", types.SEVERITY_ERROR, tc.count)
		})
	}
}

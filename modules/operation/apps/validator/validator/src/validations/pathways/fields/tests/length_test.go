package pathways_fields_test

import (
	"main/services"
	"main/types"
	checks "main/validations/pathways/fields/checks"
	testutils "main/validations/pathways/utils"
	"strings"
	"testing"
)

func TestLengthField(t *testing.T) { testutils.CheckPresence(t, "length", checks.LengthField) }
func TestLengthConditionalPresence(t *testing.T) {
	const id = "pathways_length_field"
	for _, mode := range []string{"1", "6", "7"} {
		config := testutils.Config(id, types.SEVERITY_ERROR)
		_, ctx := testutils.Fixture(t, map[string]any{"length": "", "pathway_mode": mode}, config)
		if err := checks.LengthField(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		testutils.AssertFindings(t, id, "length", types.SEVERITY_ERROR, 1)
		for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
			if !strings.Contains(msg.Message, "recommended") {
				t.Fatalf("expected recommendation: %+v", msg)
			}
		}
	}
}

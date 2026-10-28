package fields_test

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"strings"
	"testing"
)

func TestMaxSlopeField(t *testing.T) {
	validationutils.PathwaysCheckPresence(t, "max_slope", fields.MaxSlopeField)
}
func TestMaxSlopeConditionalPresence(t *testing.T) {
	const id = "pathways_max_slope_field"
	for _, mode := range []string{"1", "3"} {
		config := validationutils.PathwaysConfig(id, types.SEVERITY_ERROR)
		_, ctx := validationutils.PathwaysFixture(t, map[string]any{"max_slope": "", "pathway_mode": mode}, config)
		if err := fields.MaxSlopeField(ctx, config.Rule(id)); err != nil {
			t.Fatal(err)
		}
		validationutils.PathwaysAssertFindings(t, id, "max_slope", types.SEVERITY_ERROR, 1)
		for _, msg := range services.AppMessageService.GetSummary().AllMessages() {
			if !strings.Contains(msg.Message, "recommended") {
				t.Fatalf("expected recommendation: %+v", msg)
			}
		}
	}
}

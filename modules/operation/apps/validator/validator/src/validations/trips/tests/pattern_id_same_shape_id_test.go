package trips

import (
	"main/i18n"
	"main/lib"
	"main/lib/rules"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestPatternIdSameShapeIdValidation(t *testing.T) {
	rules.ConfigureMessageSeverities(nil)
	t.Cleanup(services.AppMessageService.Clear)
	for _, tc := range []struct {
		name           string
		pattern, shape *string
		mismatch       bool
	}{
		{"matching", lib.Ptr("1001_0_0"), lib.Ptr("1001_0_0"), false},
		{"different", lib.Ptr("pattern-other"), lib.Ptr("1001_0_0"), true},
		{"missing pattern", nil, lib.Ptr("1001_0_0"), false},
		{"missing shape", lib.Ptr("1001_0_0"), nil, false},
	} {
		for _, severity := range []types.Severity{types.SEVERITY_ERROR, types.SEVERITY_WARNING, types.SEVERITY_IGNORE} {
			t.Run(tc.name+"/"+string(severity), func(t *testing.T) {
				services.AppMessageService.Clear()
				trip := &types.Trip{PatternId: tc.pattern, ShapeId: tc.shape}
				config := &types.TripsRules{PatternIdSameShapeId: types.RuleConfig{Severity: severity}}
				validations.PatternIdSameShapeIdValidation(trip, 5, nil, config)
				messages := services.AppMessageService.GetSummary().AllMessages()
				if !tc.mismatch || severity == types.SEVERITY_IGNORE {
					if len(messages) != 0 {
						t.Fatalf("unexpected messages: %+v", messages)
					}
					return
				}
				if len(messages) != 1 {
					t.Fatalf("expected one message: %+v", messages)
				}
				message := messages[0]
				if message.RuleID != "trips_pattern_id_needs_to_be_the_same_as_shape_id" || message.Field != "pattern_id" || message.Severity != severity {
					t.Fatalf("incorrect rule metadata: %+v", message)
				}
				want := i18n.AppTranslator.Get("trips_pattern_id_needs_to_be_the_same_as_shape_id.not_matching", *tc.pattern, *tc.shape)
				if message.Message != want {
					t.Fatalf("got %q, want %q", message.Message, want)
				}
			})
		}
	}
}

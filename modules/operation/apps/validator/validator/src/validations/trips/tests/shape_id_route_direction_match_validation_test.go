package trips

import (
	"main/i18n"
	"main/lib"
	"main/lib/rules/rules"
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"strings"
	"testing"
)

func TestShapeIdRouteDirectionMatchValidation(t *testing.T) {
	cases := []struct {
		name         string
		route, shape *string
		direction    *int
		mismatch     bool
	}{
		{"outbound", lib.Ptr("1001"), lib.Ptr("1001_0"), lib.Ptr(0), false},
		{"inbound", lib.Ptr("1001"), lib.Ptr("1001_1"), lib.Ptr(1), false},
		{"route containing underscores", lib.Ptr("1001_2"), lib.Ptr("1001_2_0"), lib.Ptr(0), false},
		{"leading zeros", lib.Ptr("0012"), lib.Ptr("0012_0"), lib.Ptr(0), false},
		{"alphanumeric route", lib.Ptr("R-12"), lib.Ptr("R-12_1"), lib.Ptr(1), false},
		{"wrong route", lib.Ptr("1001"), lib.Ptr("1002_0"), lib.Ptr(0), true},
		{"wrong direction", lib.Ptr("1001"), lib.Ptr("1001_1"), lib.Ptr(0), true},
		{"missing separator", lib.Ptr("1001"), lib.Ptr("10010"), lib.Ptr(0), true},
		{"extra variant", lib.Ptr("1001"), lib.Ptr("1001_0_1"), lib.Ptr(0), true},
		{"missing route", nil, lib.Ptr("1001_0"), lib.Ptr(0), false},
		{"missing shape", lib.Ptr("1001"), nil, lib.Ptr(0), false},
		{"missing direction", lib.Ptr("1001"), lib.Ptr("1001_0"), nil, false},
		{"empty route", lib.Ptr(""), lib.Ptr("1001_0"), lib.Ptr(0), false},
		{"empty shape", lib.Ptr("1001"), lib.Ptr(""), lib.Ptr(0), false},
		{"invalid direction", lib.Ptr("1001"), lib.Ptr("1001_0"), lib.Ptr(2), false},
		{"negative direction", lib.Ptr("1001"), lib.Ptr("1001_0"), lib.Ptr(-1), false},
	}
	rules.ConfigureMessageSeverities(nil)
	t.Cleanup(services.AppMessageService.Clear)
	for _, tc := range cases {
		for _, severity := range []types.Severity{types.SEVERITY_WARNING, types.SEVERITY_ERROR, types.SEVERITY_IGNORE} {
			t.Run(tc.name+"/"+string(severity), func(t *testing.T) {
				services.AppMessageService.Clear()
				trip := &types.Trip{RouteId: tc.route, ShapeId: tc.shape, DirectionId: tc.direction}
				config := &types.TripsRules{ShapeIdRouteDirectionMatch: types.RuleConfig{Severity: severity}}
				validations.ShapeIdRouteDirectionMatchValidation(trip, 5, nil, config)
				messages := services.AppMessageService.GetSummary().AllMessages()
				want := 0
				if tc.mismatch && severity != types.SEVERITY_IGNORE {
					want = 1
				}
				if len(messages) != want {
					t.Fatalf("got %+v; want %d messages", messages, want)
				}
				if want == 0 {
					return
				}
				message := messages[0]
				if message.RuleID != "trips_shape_id_matches_route_id_and_direction_id" || message.Field != "shape_id" || message.FileName != "trips.txt" || message.Severity != severity || len(message.Rows) != 1 || message.Rows[0] != 7 {
					t.Fatalf("incorrect metadata: %+v", message)
				}
				if !strings.Contains(message.Message, `"1001_0"`) || !strings.Contains(message.Message, *tc.shape) || strings.Contains(message.Message, "%!") {
					t.Fatalf("missing expected or actual shape_id: %s", message.Message)
				}
			})
		}
	}
}

func TestShapeIdRouteDirectionMatchTranslations(t *testing.T) {
	for _, lang := range []string{"en", "pt"} {
		key := "shape_id_route_direction_match.not_matching"
		message := i18n.NewTranslator(lang).Get(key, "bad", "1001_0", "1001", 0)
		if message == key || strings.Contains(message, "%!") || !strings.Contains(message, "1001_0") {
			t.Fatalf("%s: %s", lang, message)
		}
	}
}

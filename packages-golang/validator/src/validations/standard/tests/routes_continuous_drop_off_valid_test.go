package standard_test

import (
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standard/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestRoutesContinuousDropOffValid(t *testing.T) {
	const id = "routes_continuous_drop_off_valid"
	for _, tc := range []struct {
		name     string
		value    any
		missing  bool
		severity types.Severity
		windows  map[string]bool
		options  *[]string
		count    int
	}{
		{name: "Enabled", value: "0", severity: types.SEVERITY_ERROR},
		{name: "PhoneAgency", value: "2", severity: types.SEVERITY_ERROR},
		{name: "CoordinateDriver", value: "3", severity: types.SEVERITY_ERROR},
		{name: "Empty", value: "", severity: types.SEVERITY_ERROR, count: 1},
		{name: "Null", value: nil, severity: types.SEVERITY_ERROR, count: 1},
		{name: "MissingColumn", missing: true, severity: types.SEVERITY_ERROR, count: 1},
		{name: "Disabled", value: "1", severity: types.SEVERITY_ERROR, count: 1},
		{name: "ForbiddenWithoutWindow", value: "0", severity: types.SEVERITY_FORBIDDEN},
		{name: "ForbiddenDisabled", value: "1", severity: types.SEVERITY_FORBIDDEN},
		{name: "ForbiddenEmpty", value: "", severity: types.SEVERITY_FORBIDDEN},
		{name: "WindowOnRoute", value: "2", severity: types.SEVERITY_ERROR, windows: map[string]bool{"R1": true}, count: 1},
		{name: "WindowOnOtherRoute", value: "2", severity: types.SEVERITY_ERROR, windows: map[string]bool{"R2": true}},
		{name: "AllowedOption", value: "2", severity: types.SEVERITY_ERROR, options: &[]string{"2"}},
		{name: "OptionsDoNotRestrictValues", value: "2", severity: types.SEVERITY_ERROR, options: &[]string{"0"}},
		{name: "EmptyOptionsDoNotRestrictValues", value: "2", severity: types.SEVERITY_ERROR, options: &[]string{}},
		{name: "AllOptions", value: "2", severity: types.SEVERITY_ERROR, options: &[]string{types.ALL_OPTIONS}},
		{name: "WindowOverridesAllOptions", value: "2", severity: types.SEVERITY_ERROR, options: &[]string{types.ALL_OPTIONS}, windows: map[string]bool{"R1": true}, count: 1},
		{name: "Warning", value: "", severity: types.SEVERITY_WARNING, count: 1},
		{name: "Info", value: "", severity: types.SEVERITY_INFO, count: 1},
		{name: "Ignore", value: "2", severity: types.SEVERITY_IGNORE, windows: map[string]bool{"R1": true}},
		{name: "Unspecified", value: ""},
	} {
		t.Run(tc.name, func(t *testing.T) {
			config := validationutils.RoutesConfig(id, tc.severity)
			config.SetRule(id, types.RuleContext{Severity: tc.severity, Options: tc.options})
			values := map[string]any{"route_id": "R1"}
			if !tc.missing {
				values["continuous_drop_off"] = tc.value
			}
			_, ctx := validationutils.RoutesFixture(t, values, config)
			if err := standard.RoutesContinuousDropOffValid(ctx, config.Rule("routes_continuous_drop_off_valid"), tc.windows); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "continuous_drop_off", tc.severity, tc.count)
		})
	}
	for name, config := range map[string]*types.GtfsRules{"NilRules": nil, "MissingRule": {}} {
		t.Run(name, func(t *testing.T) {
			_, ctx := validationutils.RoutesFixture(t, map[string]any{"continuous_drop_off": ""}, config)
			if err := standard.RoutesContinuousDropOffValid(ctx, config.Rule("routes_continuous_drop_off_valid"), nil); err != nil {
				t.Fatal(err)
			}
			validationutils.RoutesAssertFindings(t, id, "continuous_drop_off", types.SEVERITY_IGNORE, 0)
		})
	}
	t.Run("ReadFailure", func(t *testing.T) {
		config := validationutils.RoutesConfig(id, types.SEVERITY_ERROR)
		connection, ctx := validationutils.RoutesFixture(t, map[string]any{"continuous_drop_off": "0"}, config)
		connection.Close()
		if err := standard.RoutesContinuousDropOffValid(ctx, config.Rule("routes_continuous_drop_off_valid"), nil); err == nil {
			t.Fatal("SQLite error was swallowed")
		}
		validationutils.RoutesAssertFindings(t, id, "continuous_drop_off", types.SEVERITY_ERROR, 0)
	})
}

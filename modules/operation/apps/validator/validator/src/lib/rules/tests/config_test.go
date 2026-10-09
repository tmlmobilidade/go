package rules_test

import (
	"main/lib/rules/rules"
	"main/types"
	"slices"
	"testing"
)

func TestDependenciesFromReadsDependsOn(t *testing.T) {
	section := types.AgencyRules{
		AgencyNameIdMatch: types.RuleConfig{DependsOn: []string{"agency_id_unique", "agency_name_present"}},
	}
	deps := rules.DependenciesFrom(section)
	if len(deps) != len(rules.RuleIDs(section)) || !slices.Equal(deps["agency_id_matched_with_agency_name"], []string{"agency_id_unique", "agency_name_present"}) {
		t.Fatalf("deps = %v", deps)
	}
}

func TestWithDependenciesAppliesJsonDependencies(t *testing.T) {
	ran := []string{}
	list := rules.WithDependencies(
		[]rules.Rule[int]{ruleWith("match", rules.Passed, &ran), ruleWith("name", rules.Failed, &ran)},
		map[string][]string{"match": {"name"}},
	)
	m, err := rules.NewManager(list...)
	if err != nil {
		t.Fatal(err)
	}
	if status := m.RunRow(0); status["match"] != rules.Skipped {
		t.Fatalf("status = %v", status)
	}
}

func TestValidateSection(t *testing.T) {
	tests := []struct {
		name    string
		section types.AgencyRules
		wantErr bool
	}{
		{"no dependencies", types.AgencyRules{}, false},
		{"valid", types.AgencyRules{
			AgencyNameIdMatch: types.RuleConfig{DependsOn: []string{"agency_id_unique", "agency_name_present"}},
		}, false},
		{"unknown rule id", types.AgencyRules{
			AgencyNameIdMatch: types.RuleConfig{DependsOn: []string{"agency_id_typo"}},
		}, true},
		{"cycle", types.AgencyRules{
			AgencyId:   types.RuleConfig{DependsOn: []string{"agency_name_present"}},
			AgencyName: types.RuleConfig{DependsOn: []string{"agency_id_unique"}},
		}, true},
		{"depends on itself", types.AgencyRules{
			AgencyId: types.RuleConfig{DependsOn: []string{"agency_id_unique"}},
		}, true},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := rules.ValidateSection(tc.section)
			if (err != nil) != tc.wantErr {
				t.Fatalf("err = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

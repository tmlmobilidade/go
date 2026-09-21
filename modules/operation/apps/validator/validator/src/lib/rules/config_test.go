package rules

import (
	"main/types"
	"slices"
	"testing"
)

func TestDependenciesFromReadsDependsOn(t *testing.T) {
	section := types.AgencyRules{
		AgencyNameIdMatch: types.RuleConfig{DependsOn: []string{"agency_id_unique", "agency_name_present"}},
	}
	deps := DependenciesFrom(section)
	if len(deps) != 1 || !slices.Equal(deps["agency_id_matched_with_agency_name"], []string{"agency_id_unique", "agency_name_present"}) {
		t.Fatalf("deps = %v", deps)
	}
}

func TestWithDependenciesAppliesJsonDependencies(t *testing.T) {
	ran := []string{}
	list := WithDependencies(
		[]Rule[int]{ruleWith("match", Passed, &ran), ruleWith("name", Failed, &ran)},
		map[string][]string{"match": {"name"}},
	)
	m, err := NewManager(list...)
	if err != nil {
		t.Fatal(err)
	}
	if status := m.RunRow(0); status["match"] != Skipped {
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
			err := ValidateSection(tc.section)
			if (err != nil) != tc.wantErr {
				t.Fatalf("err = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}

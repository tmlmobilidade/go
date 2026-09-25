package rules

import (
	"main/types"
	"reflect"
	"slices"
	"testing"
)

func TestDependencyContractCoversEveryRuleAndIsAcyclic(t *testing.T) {
	if err := ValidateDependencyContract(); err != nil {
		t.Fatal(err)
	}
	root := reflect.TypeOf(types.GtfsRules{})
	for i := range root.NumField() {
		group := root.Field(i).Tag.Get("json")
		if group == "file_validation" {
			continue
		}
		section := reflect.New(root.Field(i).Type).Elem().Interface()
		deps := DependenciesFrom(section)
		var reachesFile func(string) bool
		reachesFile = func(id string) bool {
			if id == FileNode(group) {
				return true
			}
			for _, dependency := range deps[id] {
				if reachesFile(dependency) {
					return true
				}
			}
			return false
		}
		for _, id := range RuleIDs(section) {
			if !reachesFile(id) {
				t.Errorf("%s.%s has no file prerequisite", group, id)
			}
		}
	}
}

func TestConfiguredDependenciesExtendStructuralDAG(t *testing.T) {
	section := types.AgencyRules{AgencyNameIdMatch: types.RuleConfig{DependsOn: []string{"agency_url_valid_url"}}}
	deps := DependenciesFrom(section)
	for _, want := range []string{"agency_id_unique", "agency_name_present", "agency_url_valid_url"} {
		if !slices.Contains(deps["agency_id_matched_with_agency_name"], want) {
			t.Errorf("missing %s", want)
		}
	}
	section.AgencyId.DependsOn = []string{"agency_id_matched_with_agency_name"}
	if err := ValidateSection(section); err == nil {
		t.Fatal("cycle through a default prerequisite accepted")
	}
	section.AgencyId.DependsOn = []string{"agency_file_present"}
	if err := ValidateSection(section); err != nil {
		t.Fatal(err)
	}
}

func TestRowRuleCannotDependOnLaterGroupPhase(t *testing.T) {
	section := types.ShapesRules{ShapeId: types.RuleConfig{DependsOn: []string{"shape_pt_sequence_strictly_increasing"}}}
	if err := ValidateSection(section); err == nil {
		t.Fatal("row-to-group dependency accepted")
	}
}

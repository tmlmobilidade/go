package gtfsvalidator_test

import (
	"slices"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

func TestFieldHelpersUseRequestedTable(t *testing.T) {
	db := openSQLTestDatabase(t, `
		CREATE TABLE stops (stop_name TEXT);
		INSERT INTO stops VALUES ('Terminal'), ('Park'), (NULL);
	`)
	config := types.Rule{Severity: types.SEVERITY_WARNING, Modifiers: types.RuleOptionsModifier{"Terminal"}}

	for _, check := range []struct {
		name string
		run  func() (bool, []types.Finding, error)
		row  int
	}{
		{"presence", func() (bool, []types.Finding, error) {
			return fields.CheckPresence(t.Context(), db, config, "stops", "stop_name", true)
		}, 2},
		{"options", func() (bool, []types.Finding, error) {
			return fields.CheckOptions(t.Context(), db, config, "stops", "stop_name")
		}, 1},
	} {
		passed, findings, err := check.run()
		if err != nil || passed || len(findings) != 1 {
			t.Fatalf("%s check got passed=%t, findings=%+v, error=%v", check.name, passed, findings, err)
		}
		finding := findings[0]
		if finding.FileName != "stops.txt" || finding.Field != "stop_name" || !slices.Equal(finding.Rows, []int{check.row}) {
			t.Errorf("%s check got %+v, want stops.txt stop_name at row %d", check.name, finding, check.row)
		}
	}
}

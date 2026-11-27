package gtfsvalidator_test

import (
	"os"
	"path/filepath"
	"slices"
	"testing"

	validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

func TestAgencyEmailRules(t *testing.T) {
	const fieldRule = "agency_email_exists"
	const formatRule = "agency_email_valid"

	type expectedFinding struct {
		ruleID   string
		severity types.Severities
		rows     []int
	}
	for _, test := range []struct {
		name     string
		agency   string
		severity types.Severities
		want     []expectedFinding
	}{
		{
			name:     "optional missing column",
			agency:   "agency_name\nExample\n",
			severity: types.SEVERITY_WARNING,
		},
		{
			name:     "optional blank values",
			agency:   "agency_name,agency_email\nEmpty,\nWhitespace,  \t\n",
			severity: types.SEVERITY_WARNING,
		},
		{
			name:     "optional invalid value",
			agency:   "agency_name,agency_email\nExample,bad-email\n",
			severity: types.SEVERITY_WARNING,
			want:     []expectedFinding{{formatRule, types.SEVERITY_WARNING, []int{2}}},
		},
		{
			name:     "required missing column in header-only file",
			agency:   "agency_name\n",
			severity: types.SEVERITY_ERROR,
			want:     []expectedFinding{{fieldRule, types.SEVERITY_ERROR, nil}},
		},
		{
			name: "required mixed values",
			agency: "agency_name,agency_email\n" +
				"Empty,\nWhitespace,  \t\nInvalid,bad-email\n" +
				"Address,  help@example.org  \nDisplay Name, Support <help@example.org> \n",
			severity: types.SEVERITY_ERROR,
			want: []expectedFinding{
				{fieldRule, types.SEVERITY_ERROR, []int{2, 3}},
				{formatRule, types.SEVERITY_WARNING, []int{4}},
			},
		},
		{
			name:     "missing agency file",
			severity: types.SEVERITY_ERROR,
			want:     []expectedFinding{{"agency_file_exists", types.SEVERITY_ERROR, nil}},
		},
	} {
		t.Run(test.name, func(t *testing.T) {
			files := map[string]string{}
			if test.agency != "" {
				files["agency.txt"] = test.agency
			}
			path := filepath.Join(t.TempDir(), "feed.zip")
			if err := os.WriteFile(path, archive(t, files), 0600); err != nil {
				t.Fatal(err)
			}

			fileDependency := []string{"agency_file_exists"}
			report, err := validator.GtfsValidator(t.Context(), validator.Options{
				Source:      importgtfs.ImportGtfsConfigSource{Path: path},
				Concurrency: 2,
				Rules: []types.Rule{
					{RuleID: "agency_file_exists", Severity: types.SEVERITY_ERROR},
					{RuleID: fieldRule, Severity: test.severity, DependsOn: fileDependency},
					{RuleID: formatRule, Severity: types.SEVERITY_WARNING, DependsOn: fileDependency},
				},
			})
			if err != nil {
				t.Fatal(err)
			}
			if len(report.Results) != len(test.want) {
				t.Fatalf("report messages = %+v, want %d groups", report.Results, len(test.want))
			}
			for i, want := range test.want {
				got := report.Results[i]
				if got.RuleID != want.ruleID || got.Severity != want.severity {
					t.Errorf("finding group = %+v, want %s at %s", got, want.ruleID, want.severity)
				}
				if len(got.Messages) != 1 || !slices.Equal(got.Messages[0].Rows, want.rows) {
					t.Errorf("finding details = %+v, want one finding for rows %v", got.Messages, want.rows)
				}
			}
		})
	}
}

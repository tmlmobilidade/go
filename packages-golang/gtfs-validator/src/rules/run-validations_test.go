package rules

import (
	"context"
	"database/sql"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func TestFindingsBlockDependentsAtEveryReportedSeverity(t *testing.T) {
	for _, severity := range []types.Severities{SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR, SEVERITY_FORBIDDEN} {
		t.Run(string(severity), func(t *testing.T) {
			outcome, err := runCheck(context.Background(), nil, types.Rule{Severity: severity},
				func(context.Context, *sql.DB, types.Rule) (bool, []Finding, error) {
					return true, []Finding{{Message: "finding"}}, nil
				})
			if err != nil || !outcome.Failed || len(outcome.Value) != 1 || outcome.Value[0].Severity != severity {
				t.Fatalf("outcome = %+v, error = %v", outcome, err)
			}
		})
	}
}

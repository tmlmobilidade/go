package agency

import (
	"context"
	"database/sql"
	"fmt"
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

// AgencyIDMatchedWithAgencyName checks each ID and name against the configured pairs.
func (AgencyChecks) AgencyIDMatchedWithAgencyName(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Skip comparison when no agency ID and name pairs are configured
	comparisons := config.Compare()
	if comparisons == nil {
		return true, nil, nil
	}

	// 2. Check if the agency table exists
	exists, err := sqlutils.TableExists(ctx, db, agencyTable)
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 3. Compare each agency ID and name against the configured pairs
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, agencyTable, []string{idColumn, nameColumn}, func(row int, values map[string]string) error {
		id := values[idColumn]
		name := values[nameColumn]
		if !slices.Contains(comparisons, types.RuleComparison{Key: id, Value: name}) {
			findings = append(findings, types.Finding{
				Description: "An agency ID and name pair is outside the configured pairs.",
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Agency ID %q has an unexpected name %q.", id, name),
				FileName:    agencyFile,
				Field:       idColumn,
				Rows:        []int{row},
			})
		}
		return nil
	})

	// 4. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

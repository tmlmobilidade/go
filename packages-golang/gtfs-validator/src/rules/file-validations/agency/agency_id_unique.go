package agency

import (
	"context"
	"database/sql"
	"fmt"
	"maps"
	"slices"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

// AgencyIDUnique reports repeated IDs with all of their source rows.
func (AgencyChecks) AgencyIDUnique(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	rowsByID := make(map[string][]int)
	err := fields.ForEachValue(ctx, db, agencyTable, idColumn, func(row int, value string) {
		rowsByID[value] = append(rowsByID[value], row)
	})
	if err != nil {
		return false, nil, err
	}

	var findings []types.Finding
	for _, id := range slices.Sorted(maps.Keys(rowsByID)) {
		rows := rowsByID[id]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description: "The agency_id field contains duplicate IDs.",
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Agency ID %q is used on multiple rows.", id),
				FileName:    agencyFile,
				Field:       idColumn,
				Rows:        rows,
			})
		}
	}
	return len(findings) == 0, findings, nil
}

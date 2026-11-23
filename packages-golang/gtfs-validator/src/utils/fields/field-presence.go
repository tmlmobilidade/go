package fields

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

// CheckPresence requires the column and a nonblank value on every row when
// GTFS requires the field or the rule is configured at error severity.
func CheckPresence(ctx context.Context, db *sql.DB, config types.Rule, table, column string, requiredByGTFS bool) (bool, []types.Finding, error) {
	if !requiredByGTFS && config.Severity != types.SEVERITY_ERROR {
		return true, nil, nil
	}

	hasColumn, err := sqlutils.ColumnExists(ctx, db, table, column)
	if err != nil {
		return false, nil, err
	}
	finding := types.Finding{
		Description: fmt.Sprintf("The required %s is missing.", strings.ReplaceAll(column, "_", " ")),
		Severity:    config.Severity,
		FileName:    table + ".txt",
		Field:       column,
	}
	if !hasColumn {
		hasTable, err := sqlutils.TableExists(ctx, db, table)
		if err != nil || !hasTable {
			return err == nil, nil, err
		}
		finding.Message = fmt.Sprintf("The required %s column is missing.", column)
		return false, []types.Finding{finding}, nil
	}

	err = sqlutils.ForEachRow(ctx, db, table, []string{column}, func(row int, values map[string]string) error {
		if strings.TrimSpace(values[column]) == "" {
			finding.Rows = append(finding.Rows, row)
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	if len(finding.Rows) == 0 {
		return true, nil, nil
	}
	finding.Message = fmt.Sprintf("The required %s value is blank.", column)
	return false, []types.Finding{finding}, nil
}

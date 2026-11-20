package fields

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

// CheckFilePresence gates rules on the imported table, even at ignore severity.
func CheckFilePresence(ctx context.Context, db *sql.DB, config types.Rule, table string) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, table)
	if err != nil {
		return false, nil, err
	}
	required := config.Severity != types.SEVERITY_FORBIDDEN
	if exists == required {
		return true, nil, nil
	}
	if config.Severity == types.SEVERITY_IGNORE {
		return false, nil, nil
	}

	file := table + ".txt"
	message := fmt.Sprintf("The required %s file is missing.", file)
	if exists {
		message = fmt.Sprintf("The forbidden %s file is present.", file)
	}
	return false, []types.Finding{{
		Description: message,
		Severity:    config.Severity,
		Message:     message,
		FileName:    file,
	}}, nil
}

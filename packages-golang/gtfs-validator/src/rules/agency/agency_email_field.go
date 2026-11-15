package agency

import (
	"context"
	"database/sql"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

const (
	agencyTable = "agency"
	agencyFile  = agencyTable + ".txt"
	emailColumn = "agency_email"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_email
  - Presence: Optional
  - Type: Email

# Description

Email address actively monitored by the agency's customer service department. This address provides a direct way
for riders to contact customer service.

Presence and type follow [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyEmailField(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	if config.Severity != types.SEVERITY_ERROR {
		return true, nil, nil
	}

	hasColumn, err := sqlutils.ColumnExists(ctx, db, agencyTable, emailColumn)
	if err != nil {
		return false, nil, err
	}
	finding := types.Finding{
		Description: "The required agency email is missing.",
		Severity:    config.Severity,
		FileName:    agencyFile,
		Field:       emailColumn,
	}
	if !hasColumn {
		hasTable, err := sqlutils.TableExists(ctx, db, agencyTable)
		if err != nil || !hasTable {
			return err == nil, nil, err
		}
		finding.Message = "The required agency_email column is missing."
		return false, []types.Finding{finding}, nil
	}

	err = sqlutils.ForEachRow(ctx, db, agencyTable, []string{emailColumn}, func(row int, values map[string]string) error {
		if strings.TrimSpace(values[emailColumn]) == "" {
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
	finding.Message = "The required agency_email value is blank."
	return false, []types.Finding{finding}, nil
}

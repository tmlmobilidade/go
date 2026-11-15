package agency

import (
	"context"
	"database/sql"
	"fmt"
	"net/mail"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
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

Validation: Checks the address syntax after trimming surrounding whitespace. Display-name addresses can be
accepted. It does not verify that the mailbox exists or apply configured value lists. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyEmailValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	hasColumn, err := sqlutils.ColumnExists(ctx, db, agencyTable, emailColumn)
	if err != nil || !hasColumn {
		return err == nil, nil, err
	}

	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, agencyTable, []string{emailColumn}, func(row int, values map[string]string) error {
		value := strings.TrimSpace(values[emailColumn])
		if value == "" {
			return nil
		}
		if _, err := mail.ParseAddress(value); err != nil {
			findings = append(findings, types.Finding{
				Description: "The agency_email field contains an invalid email address.",
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Invalid email address %q.", value),
				FileName:    agencyFile,
				Field:       emailColumn,
				Rows:        []int{row},
			})
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	return len(findings) == 0, findings, nil
}

package agency

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

const emailColumn = "agency_email"

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
func (AgencyChecks) AgencyEmailValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate each supplied email address
	var findings []types.Finding
	err := fields.ForEachValue(ctx, db, agencyTable, emailColumn, func(row int, value string) {
		if !validators.ValidateEmail(value) {
			findings = append(findings, types.Finding{
				Description: "The agency_email field contains an invalid email address.",
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Invalid email address %q.", strings.TrimSpace(value)),
				FileName:    agencyFile,
				Field:       emailColumn,
				Rows:        []int{row},
			})
		}
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}

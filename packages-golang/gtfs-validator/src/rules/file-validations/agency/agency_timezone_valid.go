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

// AgencyTimezoneValid checks IANA timezone names and requires a common timezone across agencies.
func (AgencyChecks) AgencyTimezoneValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Validate each supplied timezone and collect valid source rows
	const description = "Agency timezones must be valid and consistent across the feed."
	var findings []types.Finding
	var validRows []int
	timezones := make(map[string]struct{})

	err := fields.ForEachValue(ctx, db, agencyTable, timezoneColumn, func(row int, value string) {
		value = strings.TrimSpace(value)
		if !validators.ValidateTimezone(value) {
			findings = append(findings, types.Finding{
				Description: description,
				Severity:    config.Severity,
				Message:     fmt.Sprintf("Invalid IANA timezone %q.", value),
				FileName:    agencyFile,
				Field:       timezoneColumn,
				Rows:        []int{row},
			})
			return
		}
		timezones[value] = struct{}{}
		validRows = append(validRows, row)
	})
	if err != nil {
		return false, nil, err
	}

	// 2. Report inconsistent timezones across agencies
	if len(timezones) > 1 {
		findings = append(findings, types.Finding{
			Description: description,
			Severity:    config.Severity,
			Message:     "All agencies in the feed must use the same timezone.",
			FileName:    agencyFile,
			Field:       timezoneColumn,
			Rows:        validRows,
		})
	}

	// 3. Return the findings
	return len(findings) == 0, findings, nil
}

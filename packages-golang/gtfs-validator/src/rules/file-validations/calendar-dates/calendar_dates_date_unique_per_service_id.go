package calendardates

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: service_id, date
  - Presence: Required
  - Type: ID and date

# Description

Each service ID and date pair may occur only once, regardless of exception
type. Different services may use the same date. Service IDs are compared
exactly and dates are compared after trimming whitespace. The presence and
format rules handle missing values and invalid dates.

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
*/
func (CalendarDatesChecks) CalendarDatesDateUniquePerServiceID(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the calendar_dates table exists
	exists, err := sqlutils.TableExists(ctx, db, "calendar_dates")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Collect source rows for each valid service ID and date pair
	type serviceDate struct {
		serviceID string
		date      string
	}
	rowsByPair := make(map[serviceDate][]int)
	var pairs []serviceDate
	err = sqlutils.ForEachRow(ctx, db, "calendar_dates", []string{"service_id", "date"}, func(row int, values map[string]string) error {
		pair := serviceDate{serviceID: values["service_id"], date: strings.TrimSpace(values["date"])}
		if strings.TrimSpace(pair.serviceID) == "" || !validators.ValidateDate(pair.date) {
			return nil
		}
		if len(rowsByPair[pair]) == 0 {
			pairs = append(pairs, pair)
		}
		rowsByPair[pair] = append(rowsByPair[pair], row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Report each repeated pair with all of its source rows
	var findings []types.Finding
	for _, pair := range pairs {
		rows := rowsByPair[pair]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description: "The date must be unique within each service_id.",
				Message:     fmt.Sprintf("The date %q occurs multiple times for service_id %q.", pair.date, pair.serviceID),
				Severity:    config.Severity,
				FileName:    "calendar_dates.txt",
				Field:       "date",
				Rows:        rows,
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}

package stoptimes

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"strings"
)

func (StopTimesChecks) StopTimesPickupBookingRuleIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"pickup_booking_rule_id"}, func(row int, values map[string]string) error {
		value := values["pickup_booking_rule_id"]
		if strings.TrimSpace(value) == "" {
			return nil
		}
		exists, err := sqlutils.TableExists(ctx, db, "booking_rules")
		if err != nil {
			return err
		}
		if exists {
			exists, err = sqlutils.Exists(ctx, db, "booking_rules", "booking_rule_id", value)
			if err != nil {
				return err
			}
		}
		if !exists {
			findings = append(findings, types.Finding{Description: "The pickup_booking_rule_id references a missing booking_rule_id.", Message: fmt.Sprintf("Unknown booking_rule_id %q.", value), Severity: config.Severity, FileName: "stop_times.txt", Field: "pickup_booking_rule_id", Rows: []int{row}})
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	return len(findings) == 0, findings, nil
}

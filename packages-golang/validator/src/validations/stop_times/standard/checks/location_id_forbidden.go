package stop_times_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func LocationIdForbidden(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "stop_times_location_id_forbidden"
	ctx := lib.NewValidationContext("location_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.StopTimes.Field("location_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	// These are values on the current stop_time, not IDs found elsewhere in the table.
	stopID, err := db.StopTimes.Field("stop_id")
	if err != nil {
		return err
	}
	otherLocation, err := db.StopTimes.Field("location_group_id")
	if err != nil {
		return err
	}
	if stopID != "" || otherLocation != "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
	}
	return nil
}

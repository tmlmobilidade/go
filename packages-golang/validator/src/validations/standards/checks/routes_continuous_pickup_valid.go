package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	standardutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/utils"
	"strconv"
)

/*
* RoutesContinuousPickupValid checks the enum and its pickup/drop-off window restriction.
* The route/window lookup belongs to this invocation and does not depend on another rule.
 */
func RoutesContinuousPickupValid(ctx *context.ValidationContext) error {
	ready, err := context.RequireTables(ctx, "routes", "trips", "stop_times")
	if err != nil || !ready {
		return err
	}
	if context.ShouldIgnore(ctx) {
		return nil
	}
	routesWithWindows, err := standardutils.RoutesWithWindows(ctx)
	if err != nil {
		return err
	}
	return context.ForEachRow(ctx, "routes", []string{"continuous_pickup", "route_id"}, func(row *context.ValidationContext) error {
		values, err := queries.Fields(row.Source, "continuous_pickup", "route_id")
		if err != nil {
			return err
		}
		value := values["continuous_pickup"]
		if value == "" {
			return nil
		}
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 0 || parsed > 3 {
			context.AddMessage(row, context.GetTranslatedMessage(row, "invalid", value))
			return nil
		}
		if parsed != 1 && routesWithWindows[values["route_id"]] {
			context.AddMessage(row, context.GetTranslatedMessage(row, "forbidden_with_window"))
		}
		return nil
	})
}

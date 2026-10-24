package routes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteTextColorField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_text_color_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_text_color", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_text_color value

	value, err := db.Routes.Field("route_text_color")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_text_color is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}

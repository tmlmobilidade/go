package routes_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func RouteTextColorValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_text_color_valid"

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
	// 4. Check if the route_text_color is valid

	if !lib.IsHexString(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}

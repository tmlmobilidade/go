package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func RouteTypeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_type", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_type value

	value, err := db.Routes.Field("route_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_type is valid

	if value != "1" && value != "2" && value != "3" && value != "4" && value != "5" && value != "6" && value != "7" && value != "11" && value != "12" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}

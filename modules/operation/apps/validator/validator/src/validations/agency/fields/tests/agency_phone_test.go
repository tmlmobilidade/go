package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyPhoneField(t *testing.T) {
	testutils.CheckPresence(t, "agency_phone", checks.AgencyPhoneField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_phone_field": config}
	})
}

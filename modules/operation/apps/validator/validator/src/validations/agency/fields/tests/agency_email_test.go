package agency_fields_test

import (
	"main/types"
	checks "main/validations/agency/fields/checks"
	testutils "main/validations/agency/utils"
	"testing"
)

func TestAgencyEmailField(t *testing.T) {
	testutils.CheckPresence(t, "agency_email", checks.AgencyEmailField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_email_field": config}
	})
}

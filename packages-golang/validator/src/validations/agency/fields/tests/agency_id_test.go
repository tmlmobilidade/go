package agency_fields_test

import (
	checks "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/fields/checks"
	testutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/agency/utils"
	"main/types"
	"testing"
)

func TestAgencyIdField(t *testing.T) {
	testutils.CheckPresence(t, "agency_id", checks.AgencyIdField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_field": config}
	})
}

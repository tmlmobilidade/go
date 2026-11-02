package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyAgencyIdField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_id", fields.AgencyAgencyIdField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_id_field": config}
	})
}

package calendar

import (
	"main/lib/test_helpers"
	"main/services"
	"main/types"
	validations "main/validations/calendar/validations"
	"testing"
)

func TestAllServiceIdValidationTestCases(t *testing.T) {
	for _, tc := range test_helpers.GetGenericIdTestCases("service_id") {
		t.Run(tc.Name, func(t *testing.T) {
			services.AppMessageService.Clear()
			var serviceId string
			if tc.Id != nil {
				serviceId = *tc.Id
			}
			calendar := &types.Calendar{ServiceId: serviceId}
			gtfs := &types.Gtfs{IdMap: map[string]map[string][]int{"calendar": tc.ExistingIds}}
			validations.ServiceIdValidation(calendar, tc.Row, gtfs)
			test_helpers.AssertMessageCount(t, services.AppMessageService, tc.ExpectedErrors, tc.Name, types.SEVERITY_ERROR)
		})
	}
}

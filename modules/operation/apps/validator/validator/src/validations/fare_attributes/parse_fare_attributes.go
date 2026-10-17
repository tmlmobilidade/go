package fare_attributes

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseFareAttributes(rawFareAttributes types.FareAttributeRaw, row int) types.FareAttribute {
	var (
		fareAttribute                              types.FareAttribute = types.FareAttribute{}
		fareId, currencyType, agencyId             string
		paymentMethod, transfers, transferDuration int
		price                                      float64
		messages                                   []types.Message
	)

	stringFields := map[string]*string{
		"fare_id":       &fareId,
		"currency_type": &currencyType,
		"agency_id":     &agencyId,
	}

	intFields := map[string]*int{
		"payment_method":    &paymentMethod,
		"transfers":         &transfers,
		"transfer_duration": &transferDuration,
	}

	floatFields := map[string]*float64{
		"price": &price,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "fare_attributes.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "fare_attributes_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareAttributes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareAttributes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse float fields
	for field, target := range floatFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawFareAttributes, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return fareAttribute
	}

	fareAttribute.FareId = lib.IfThenElse(rawFareAttributes.FareId != "", &fareId, nil)
	fareAttribute.CurrencyType = lib.IfThenElse(rawFareAttributes.CurrencyType != "", &currencyType, nil)
	fareAttribute.Price = lib.IfThenElse(rawFareAttributes.Price != "", &price, nil)
	fareAttribute.AgencyId = lib.IfThenElse(rawFareAttributes.AgencyId != "", &agencyId, nil)
	fareAttribute.PaymentMethod = lib.IfThenElse(rawFareAttributes.PaymentMethod != "", &paymentMethod, nil)
	fareAttribute.Transfers = lib.IfThenElse(rawFareAttributes.Transfers != "", &transfers, nil)
	fareAttribute.TransferDuration = lib.IfThenElse(rawFareAttributes.TransferDuration != "", &transferDuration, nil)

	return fareAttribute
}

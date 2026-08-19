package feed_info

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/feed_info/validations"
	"testing"
)

func TestParseFeedInfo_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	rawFeedInfo := types.FeedInfoRaw{
		FeedLang:          "en",
		FeedPublisherName: "Transit Co",
		FeedPublisherUrl:  "https://transit.example.com",
		DefaultLang:       "en",
		FeedContactEmail:  "info@transit.example.com",
		FeedContactUrl:    "https://transit.example.com/contact",
		FeedEndDate:       "20241231",
		FeedStartDate:     "20240101",
		FeedVersion:       "1.0.0",
	}
	feedInfo := validations.ParseFeedInfo(rawFeedInfo, 2)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
	if feedInfo.FeedLang == nil || *feedInfo.FeedLang != "en" {
		t.Errorf("Expected FeedLang to be 'en', got %v", feedInfo.FeedLang)
	}
	if feedInfo.FeedPublisherName == nil || *feedInfo.FeedPublisherName != "Transit Co" {
		t.Errorf("Expected FeedPublisherName to be 'Transit Co', got %v", feedInfo.FeedPublisherName)
	}
	if feedInfo.FeedPublisherUrl == nil || *feedInfo.FeedPublisherUrl != "https://transit.example.com" {
		t.Errorf("Expected FeedPublisherUrl to be 'https://transit.example.com', got %v", feedInfo.FeedPublisherUrl)
	}
	if feedInfo.DefaultLang == nil || *feedInfo.DefaultLang != "en" {
		t.Errorf("Expected DefaultLang to be 'en', got %v", feedInfo.DefaultLang)
	}
	if feedInfo.FeedContactEmail == nil || *feedInfo.FeedContactEmail != "info@transit.example.com" {
		t.Errorf("Expected FeedContactEmail to be 'info@transit.example.com', got %v", feedInfo.FeedContactEmail)
	}
	if feedInfo.FeedContactUrl == nil || *feedInfo.FeedContactUrl != "https://transit.example.com/contact" {
		t.Errorf("Expected FeedContactUrl to be 'https://transit.example.com/contact', got %v", feedInfo.FeedContactUrl)
	}
	if feedInfo.FeedEndDate == nil || *feedInfo.FeedEndDate != "20241231" {
		t.Errorf("Expected FeedEndDate to be '20241231', got %v", feedInfo.FeedEndDate)
	}
	if feedInfo.FeedStartDate == nil || *feedInfo.FeedStartDate != "20240101" {
		t.Errorf("Expected FeedStartDate to be '20240101', got %v", feedInfo.FeedStartDate)
	}
	if feedInfo.FeedVersion == nil || *feedInfo.FeedVersion != "1.0.0" {
		t.Errorf("Expected FeedVersion to be '1.0.0', got %v", feedInfo.FeedVersion)
	}
}

func TestParseFeedInfo_EmptyInput(t *testing.T) {
	services.AppMessageService.Clear()
	rawFeedInfo := types.FeedInfoRaw{}
	feedInfo := validations.ParseFeedInfo(rawFeedInfo, 1)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Empty input should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
	if feedInfo.FeedLang != nil {
		t.Errorf("Expected FeedLang to be nil, got %v", feedInfo.FeedLang)
	}
	if feedInfo.FeedPublisherName != nil {
		t.Errorf("Expected FeedPublisherName to be nil, got %v", feedInfo.FeedPublisherName)
	}
	if feedInfo.FeedPublisherUrl != nil {
		t.Errorf("Expected FeedPublisherUrl to be nil, got %v", feedInfo.FeedPublisherUrl)
	}
	if feedInfo.DefaultLang != nil {
		t.Errorf("Expected DefaultLang to be nil, got %v", feedInfo.DefaultLang)
	}
	if feedInfo.FeedContactEmail != nil {
		t.Errorf("Expected FeedContactEmail to be nil, got %v", feedInfo.FeedContactEmail)
	}
	if feedInfo.FeedContactUrl != nil {
		t.Errorf("Expected FeedContactUrl to be nil, got %v", feedInfo.FeedContactUrl)
	}
	if feedInfo.FeedEndDate != nil {
		t.Errorf("Expected FeedEndDate to be nil, got %v", feedInfo.FeedEndDate)
	}
	if feedInfo.FeedStartDate != nil {
		t.Errorf("Expected FeedStartDate to be nil, got %v", feedInfo.FeedStartDate)
	}
	if feedInfo.FeedVersion != nil {
		t.Errorf("Expected FeedVersion to be nil, got %v", feedInfo.FeedVersion)
	}
	if services.AppMessageService.GetSummary().TotalErrors != 0 {
		t.Errorf("Expected no messages, got %v", services.AppMessageService.GetSummary().TotalErrors)
	}
}

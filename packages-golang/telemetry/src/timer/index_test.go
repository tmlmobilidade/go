package timer

import (
	"testing"
	"testing/synctest"
	"time"
)

func TestTimer(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		timer := NewTimer()
		for _, test := range []struct {
			elapsedTime int64
			expected    string
		}{
			{-1, "0ms"}, {0, "0ms"}, {456, "456ms"}, {1000, "1s"},
			{3723456, "1h 2m 3s 456ms"}, {3600000, "1h"},
		} {
			if result := timer.formatElapsedTime(test.elapsedTime); result != test.expected {
				t.Fatalf("%d: got %q, want %q", test.elapsedTime, result, test.expected)
			}
		}
		timer.startTime = time.Now().Add(-3723456 * time.Millisecond)
		if result := timer.Get(); result != "1h 2m 3s 456ms" {
			t.Fatal(result)
		}
		timer.startTime = time.Now().Add(-1500 * time.Millisecond)
		if result := timer.GetSeconds(true); result < 1.5 || result > 2 {
			t.Fatal(result)
		}
		if result := timer.GetMs(); result > 100 {
			t.Fatalf("timer did not reset: %d", result)
		}
		timer.startTime = time.Now().Add(-time.Second)
		if result := timer.Get(true); result != "1s" {
			t.Fatal(result)
		}
		timer.Reset()
		if result := timer.GetMs(true); result > 100 {
			t.Fatal(result)
		}
	})
}

# Telemetry (Go)

Standard-library port of `packages-new/utils/telemetry`. The source layout and names are retained, with initial capitals for exported Go names. Import the facade from `github.com/tmlmobilidade/go/packages-golang/telemetry/src`, or import its logger and timer subpackages directly.

```go
import telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"

timer := telemetry.NewTimer()
telemetry.Logger.Info(telemetry.LogEntry{
    Message: "Ride processed",
    Attributes: map[string]any{"ride_id": "ride-1"},
})
telemetry.Logger.Success(timer.Get())
```

`ENVIRONMENT=dev` selects glyph output; other values select OpenTelemetry JSON lines. Selection happens at package initialization. Error and critical JSON logs go to stderr; other JSON logs go to stdout. Development warnings also go to stderr. Presentation helpers always print to stdout, including in production.

Level methods accept strings, Go errors, and `LogEntry` values or pointers. An empty entry message defaults to the attached error's message; `MessageOverride` can supply an explicitly empty message. Unsupported input types panic. `CreateLogger` accepts a custom renderer. The render subpackage also exposes `RenderDevTo` and `RenderStructuredTo`, which accept separate stdout and stderr writers for applications that reserve stdout for data.

Go errors do not automatically carry stacks. Errors implementing `StackTrace() string` retain that stack in both renderers; otherwise `exception.stacktrace` is omitted. Exception types use the concrete Go type name. Attributes must be JSON-serializable; serialization and output errors panic.

`NewTimer()` starts a timer. `Get()`, `GetMs()`, and `GetSeconds()` accept an optional reset boolean. `Reset()` restarts it. Timers are intended for one goroutine at a time.

Each logger also provides `SetLogLevel("info")`, `ProgressBar(processed, total)`,
and `StartPerformanceTracker(operation)`. The default minimum level is `debug`;
filtering uses the severity numbers above, so `info` retains progress, success,
warnings and errors. Invalid levels return an error without changing the filter.
Filtering is local to the logger and safe to update concurrently.

```go
operation := telemetry.Logger.StartPerformanceTracker("Preparing SQLite")
// Complete once after the operation returns. Passing an error emits failure.
operation.End(err)
```

Trackers emit a start event followed by one success or error event, with
`operation`, `status`, and `duration_ms` attributes on completion. Repeated or
concurrent calls to `End` emit only one completion. Trackers use the same renderer
and minimum level as their logger.

Go requires separate packages for subdirectories. `src/logger/levels/index.go` shares severity definitions between the logger and renderers without an import cycle.

Run `go test ./...` and `go vet ./...` from this directory.

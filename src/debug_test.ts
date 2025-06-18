import { assertEquals } from "jsr:@std/assert";
import { Debug } from "./debug.ts";

Deno.test("Debug.isEnabled() returns false by default", () => {
  // Reset environment variable
  const originalEnv = Deno.env.get("WEZTERMINATOR_DEBUG");
  Deno.env.delete("WEZTERMINATOR_DEBUG");
  Debug.setEnabled(false);

  assertEquals(Debug.isEnabled(), false);

  // Restore environment
  if (originalEnv) {
    Deno.env.set("WEZTERMINATOR_DEBUG", originalEnv);
  }
});

Deno.test("Debug.isEnabled() returns true when environment variable is set", () => {
  const originalEnv = Deno.env.get("WEZTERMINATOR_DEBUG");
  Deno.env.set("WEZTERMINATOR_DEBUG", "1");

  assertEquals(Debug.isEnabled(), true);

  // Restore environment
  if (originalEnv) {
    Deno.env.set("WEZTERMINATOR_DEBUG", originalEnv);
  } else {
    Deno.env.delete("WEZTERMINATOR_DEBUG");
  }
});

Deno.test("Debug.setEnabled() changes the enabled state", () => {
  const originalEnv = Deno.env.get("WEZTERMINATOR_DEBUG");
  Deno.env.delete("WEZTERMINATOR_DEBUG");

  Debug.setEnabled(true);
  assertEquals(Debug.isEnabled(), true);

  Debug.setEnabled(false);
  assertEquals(Debug.isEnabled(), false);

  // Restore environment
  if (originalEnv) {
    Deno.env.set("WEZTERMINATOR_DEBUG", originalEnv);
  }
});

Deno.test("Debug.logCommand() logs when enabled", () => {
  const originalEnv = Deno.env.get("WEZTERMINATOR_DEBUG");
  Debug.setEnabled(true);

  // Capture console output
  const originalLog = console.log;
  let loggedMessage = "";
  console.log = (message: string) => {
    loggedMessage = message;
  };

  Debug.logCommand("test command");
  assertEquals(loggedMessage, "[DEBUG] Running: test command");

  // Restore
  console.log = originalLog;
  Debug.setEnabled(false);
  if (originalEnv) {
    Deno.env.set("WEZTERMINATOR_DEBUG", originalEnv);
  }
});

Deno.test("Debug.logCommand() does not log when disabled", () => {
  const originalEnv = Deno.env.get("WEZTERMINATOR_DEBUG");
  Deno.env.delete("WEZTERMINATOR_DEBUG");
  Debug.setEnabled(false);

  // Capture console output
  const originalLog = console.log;
  let loggedMessage = "";
  console.log = (message: string) => {
    loggedMessage = message;
  };

  Debug.logCommand("test command");
  assertEquals(loggedMessage, "");

  // Restore
  console.log = originalLog;
  if (originalEnv) {
    Deno.env.set("WEZTERMINATOR_DEBUG", originalEnv);
  }
});

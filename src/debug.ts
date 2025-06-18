export class Debug {
  private static enabled = false;

  static setEnabled(value: boolean): void {
    Debug.enabled = value;
  }

  static isEnabled(): boolean {
    return Deno.env.get("WEZTERMINATOR_DEBUG") === "1" || Debug.enabled;
  }

  static logCommand(command: string): void {
    if (!Debug.isEnabled()) {
      return;
    }
    console.log(`[DEBUG] Running: ${command}`);
  }
}

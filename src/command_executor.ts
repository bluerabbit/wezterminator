import { Debug } from "./debug.ts";

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandError";
  }
}

export class CommandExecutor {
  static async execute(command: string): Promise<string> {
    Debug.logCommand(command);

    const cmd = new Deno.Command("sh", {
      args: ["-c", command],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await cmd.output();

    if (code !== 0) {
      const errorMessage = new TextDecoder().decode(stderr);
      throw new CommandError(`Command failed: ${command}\n${errorMessage}`);
    }

    return new TextDecoder().decode(stdout).trim();
  }

  static async executeSilent(command: string): Promise<boolean> {
    Debug.logCommand(command);

    const cmd = new Deno.Command("sh", {
      args: ["-c", command],
      stdout: "null",
      stderr: "null",
    });

    const { code } = await cmd.output();
    return code === 0;
  }
}

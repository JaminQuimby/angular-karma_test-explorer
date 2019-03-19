import { SpawnOptions } from "child_process";
import spawn = require("cross-spawn");
import { KarmaEventListener } from "../karma/karma-event-listener";

export class AngularServer {
  private angularProcess: any;

  public constructor(private angularProjectRootPath: string, private baseKarmaConfigFilePath: string) {
  }

  public stopPreviousRun(): Promise<void> {
    if (this.angularProcess != null) {
      this.angularProcess.kill();
    }

    return new Promise<void>(resolve => {
      this.angularProcess.on("exit", (code: any, signal: any) => {
        global.console.log(`Angular exited with code ${code} and signal ${signal}`);
        const karmaEventListener = KarmaEventListener.getInstance();
        karmaEventListener.stopListeningToKarma();
        resolve();
      });
    });
  }

  public start(): boolean {
    this.runNgTest();
    return true;
  }

  private runNgTest(): void {
    const cliArgs = ["test", `--karma-config="${require.resolve(this.baseKarmaConfigFilePath)}"`];
    global.console.log(`Starting Angular tests with arguments: ${cliArgs.join(" ")}`);
    
    const options = {
      cwd: this.angularProjectRootPath,
      shell: true
    } as SpawnOptions;

    this.angularProcess = spawn("ng", cliArgs, options);

    // this.angularProcess.stdout.on('data', (data: any) => global.console.log(`stdout: ${data}`));
    this.angularProcess.stderr.on('data', (data: any) => global.console.log(`stderr: ${data}`));
    // this.angularProcess.on("error", (err: any) => global.console.log(`error from ng child process: ${err}`));
  }
}

import {Configuration} from "./config";
import { Database, IDatabase } from "./database";

class Dependencies {
  public readonly configuration: Configuration;
  public readonly database: IDatabase;
  constructor() {
    console.log("Dependencies constructor");
    const config = new Configuration();

    this.configuration = config;
    this.database = new Database(config);
  }
}

export const provider = new Dependencies();

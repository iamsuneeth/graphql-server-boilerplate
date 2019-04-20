import { generateNamespace } from "@gql2ts/from-schema";
import fetchSchema from "../utils/schema";
import * as fs from "fs";
import * as path from "path";

fs.writeFile(
  path.join(__dirname, "../types/schema.d.ts"),
  generateNamespace("GQL", fetchSchema()),
  err => {
    console.log(err);
  }
);

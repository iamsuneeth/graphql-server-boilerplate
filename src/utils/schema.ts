import * as fs from "fs";
import * as path from "path";
import { makeExecutableSchema } from "graphql-tools";
import * as glob from "glob";
import { mergeResolvers, mergeTypes } from "merge-graphql-schemas";

const fetchSchema = () => {
  const modulePath = path.join(__dirname, "../modules");
  const graphqlTypes = glob
    .sync(`${modulePath}/**/*.graphql`)
    .map(type => fs.readFileSync(type, { encoding: "utf8" }));

  const resolvers = glob
    .sync(`${modulePath}/**/resolvers.?s`)
    .map(resolver => require(resolver).default);

  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers)
  });
};

export default fetchSchema;

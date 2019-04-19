import * as fs from "fs";
import * as path from "path";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import { importSchema } from "graphql-import";

const fetchSchema = () => {
  const modules = fs.readdirSync(path.join(__dirname, "../modules"));
  const schemas: GraphQLSchema[] = [];
  modules.forEach(module => {
    const resolvers = require(`../modules/${module}/resolvers`).default;
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${module}/schema.graphql`)
    );
    schemas.push(
      makeExecutableSchema({
        typeDefs,
        resolvers
      })
    );
  });
  return mergeSchemas({ schemas });
};

export default fetchSchema;

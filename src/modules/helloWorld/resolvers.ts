import { ResolverMap } from "../../types/graphql-utils";

const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`
  }
};

export default resolvers;

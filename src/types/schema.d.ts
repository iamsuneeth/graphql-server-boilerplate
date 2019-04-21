// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
hello: string;
me: IUser;
isRegistered: boolean;
}

interface IHelloOnQueryArguments {
name?: string | null;
}

interface IUser {
__typename: "User";
id: string;
name: string;
email: string;
}

interface IMutation {
__typename: "Mutation";
login: boolean;
register: boolean;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}

interface IRegisterOnMutationArguments {
email: string;
password: string;
name: string;
}
}

// tslint:enable

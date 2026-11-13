import type { CodegenConfig } from "@graphql-codegen/cli";

const strapiUrl = process.env.STRAPI_URL || "http://localhost:1337";
const strapiKey = process.env.STRAPI_KEY;

const schema: CodegenConfig["schema"] = [
  {
    [`${strapiUrl}/graphql`]: {
      headers: strapiKey
        ? {
            Authorization: `Bearer ${strapiKey}`,
          }
        : {},
    },
  },
];

/**
 * Types for `lib/strapi/graphql`. Each query is a `TypedDocumentString` that
 * carries its result and variable types; the bridge posts it with `fetch`
 * (`lib/strapi/internal/http.ts`), so there is no GraphQL client at runtime.
 */
const config: CodegenConfig = {
  generates: {
    "lib/strapi/generated/graphql.ts": {
      schema,
      documents: ["lib/strapi/graphql/**/*.graphql"],
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        documentMode: "string",
        useTypeImports: true,
        enumsAsTypes: true,
        avoidOptionals: true,
        scalars: { ID: "string", I18NLocaleCode: "string" },
      },
    },
    "lib/strapi/generated/schema.graphql": {
      schema,
      plugins: ["schema-ast"],
    },
  },
};

export default config;

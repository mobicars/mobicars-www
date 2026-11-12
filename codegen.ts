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

const commonPlugins = [
  "typescript",
  "typescript-operations",
  "typescript-graphql-request",
];

const config: CodegenConfig = {
  generates: {
    "lib/strapi/generated/graphql.ts": {
      schema,
      documents: ["lib/strapi/graphql/**/*.graphql"],
      plugins: commonPlugins,
    },
    "lib/strapi/generated/schema.graphql": {
      schema,
      documents: ["lib/strapi/graphql/**/*.graphql"],
      plugins: ["schema-ast"],
    },
  },
};

export default config;

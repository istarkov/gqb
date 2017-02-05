import { parse, Kind } from 'graphql';

// Tagged template literal function
export const gqb = (strings, ...interpolations) =>
  interpolations
    .reduce(
      (r, interpolation, i) => [
        ...r,
        ...(Array.isArray(interpolation) ? interpolation : [interpolation]),
        strings[i + 1]
      ],
      [strings[0]]
    );

// Replace every resolver call with empty string, as a result we get a real schema
const getPlainSchema = gqbSchema =>
  gqbSchema
    .map(v => (typeof v === 'function' ? '' : v))
    .join('');

// calculate position for every resolver
const getPlainResolvers = gqbSchema =>
  gqbSchema.reduce(
    (r, v) => {
      if (typeof v === 'function') {
        r.output.push({ loc: { start: r.position }, resolver: v });
      } else {
        r.position += v.length; // eslint-disable-line no-param-reassign
      }
      return r;
    },
    { position: 0, output: [] }
  ).output;


export const getResolvers = (schema) => {
  const realSchema = getPlainSchema(schema);
  const resolvers = getPlainResolvers(schema);
  const parsedSchema = parse(realSchema);

  return {
    typeDefs: realSchema,
    // Find resolvers placed immediately after the field definition
    // use locations provided by parse and getPlainResolvers
    resolvers: parsedSchema
    .definitions
    .filter(({ kind }) => kind === Kind.OBJECT_TYPE_DEFINITION)
    .reduce(
      (r, { fields, name }) => {
        fields.forEach((field) => {
          const matched = resolvers
            .find((resolver) => {
              const delta = resolver.loc.start - field.loc.end;
              // Not a smart algo - just check if field definition is 1 symbol near resolver
              return 1 >= delta && delta >= 0; // eslint-disable-line yoda
            });
          if (matched) {
            r[name.value] = { // eslint-disable-line no-param-reassign
              ...r[name.value],
              [field.name.value]: matched.resolver,
            };
          }
        });
        return r;
      },
      {}
    )
  };
};

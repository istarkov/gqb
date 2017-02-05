import { gqb, getResolvers } from '../';
import { graphql } from 'graphql'; // eslint-disable-line
import { makeExecutableSchema } from 'graphql-tools'; // eslint-disable-line

test('it works', async () => {
  const schema = gqb`
    type Query {
      hello: String${
        () => 'World'
      },
      pic(size: Int): String${
        (_, { size }) => `pic size is: ${size}`
      }
    }

    type Mutation {
      setMessage(message: String): String${
        (_, { message }) => `Mutated ${message}`
      }
    }
  `;

  const executableSchema = makeExecutableSchema(
    getResolvers(schema)
  );

  const { data } = await graphql(
    executableSchema,
    '{ hello, pic(size: 20)}'
  );

  expect(data).toMatchSnapshot();

  const { data: mutData } = await graphql(
    executableSchema,
    'mutation { setMessage(message: "Hello") }'
  );

  expect(mutData).toMatchSnapshot();
});

# GQB

This package allows you to injects type resolvers directly into GraphQL schema language.

## Why

A lot of boilerplate code if write schemas on javascript [graphql-js](https://github.com/graphql/graphql-js).

This is better [graphql-tools](https://github.com/apollographql/graphql-tools) but resolvers described
after the schema.

## How it works

Using tagged template literals we can place resolvers directly inside schema.

```javascript
import { gqb, getResolvers } from 'gqb';
import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

const schema = gqb`
  type Query {
    hello: String${ // field resolver source
      () => 'World'
    },
    pic(size: Int): String${
      (_, { size }) => `pic size is: ${size}`
    }
  }

  type Mutation {
    setMessage(message: String): String${ // mutation source
      (_, { message }) => `Mutated ${message}`
    }
  }
`;

const executableSchema = makeExecutableSchema(
  getResolvers(schema)
);

graphql(
  executableSchema,
  '{ hello, pic(size: 20)}'
)
.then(response => console.log(response));
```

Type fields resolver now are placed directly in the schema, immediatelly after type!!!

It also supports schema inlining, (*see [tests](./src/__tests__)*)

See the source it's small.

## Install

```
npm install --save gqb
```

## TODO

Type resolvers

## PS

Haven't tested at all except current repo tests, just an idea.

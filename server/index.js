const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String!
    types: [String!]
    resistant: [String!]
    weight: weight
    height: height
    fleeRate: Float!
    evolutionRequirements: evolutionRequirements
    evolutions: [evolutions]
    maxCP: Int!
    maxHP: Int!
    attacks: attacks
  }
  type evolutions {
    id: ID!
    name: String!
  }
  type evolutionRequirements {
    amount: Int!
    name: String!
  }
  type attacks {
    fast: [fast]
    special: [special]
  }
  type fast {
    name: String!
    type: String
    damage: Int
  }
  type special {
    name: String!
    type: String!
    damage: Int!
  }
  type height {
    minimum: String!
    maximum: String!
  }
  type weight {
    minimum: String!
    maximum: String!
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String!): Pokemon
    MaximumHeight(maxHeight: Float!): Pokemon
    Attacks: attacks
    Types: [String!]
  }
  type Mutation {
    updateName(id: ID!, input: String!): Pokemon
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => pokemon.name === request.name);
  },
  Attacks: () => {
    return data.attacks;
  },
  Types: () => {
    return data.types;
  },
  MaximumHeight: (request) => {
    return data.pokemon.find(
      (pokemon) =>
        Number(pokemon.height.maximum.slice(0, -1)) >= request.maxHeight
    );
  },
  updateName: (request) => {
    console.log(request);
    const targetPoke = data.pokemon.find(
      (pokemon) => pokemon.id === request.id
    );
    if (targetPoke !== undefined) {
      targetPoke.name = request.input;
    }
    return targetPoke;
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});

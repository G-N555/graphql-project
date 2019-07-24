const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: ID
    name: String
    classification: String
    types: [String]
    resistant: [String]
    weight: weight
    height: height
    fleeRate: Float
    evolutionRequirements: evolutionRequirements
    evolutions: [evolutions]
    maxCP: Int
    maxHP: Int
    attacks: attacks
  }
  type types {
    type: String!
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
    Pokemon(id: String!): Pokemon
    MaximumHeight(maxHeight: Float!): Pokemon
    AttacksFast(type: String!): [fast]
    AttacksSpecial(type: String!): [special]
    Types: [String]!
    SearchByType(name: String): [Pokemon]
    SearchByAttack(name: String): [Pokemon]
  }
  type Mutation {
    UpdateName(id: ID!, input: String!): Pokemon
    AddPokemon(name: String!, type: String!, resistant:[String!]): Pokemon
    DeletePokemon(id: String!): Pokemon
    AddType(name: String): [String!]
    UpdateType(name: String, change: String): [String]
    DeleteType: Pokemon
    AddFastAttack(name: String!, type: String!, damage:Int): attacks
    AddSpecialAttack(name: String!, type: String!, damage:Int): attacks
    UpdateAttack: Pokemon
    DeleteAttack: Pokemon
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    if (~~request.id === 0) {
      return data.pokemon.find((pokemon) => pokemon.name === request.id);
    } else {
      return data.pokemon.find((pokemon) => pokemon.id === request.id);
    }
  },
  AttacksFast: (request) => {
    if (request.type === "fast") {
      return data.attacks.fast;
    }
  },
  AttacksSpecial: (request) => {
    if (request.type === "special") {
      return data.attacks.special;
    }
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
  SearchByType: (request) => {
    return data.pokemon.filter((pokemon) =>
      pokemon.types.includes(request.name)
    );
  },
  SearchByAttack: (request) => {
    return data.pokemon.filter((pokemon) => {
      const combine = pokemon.attacks.fast.concat(pokemon.attacks.special);
      for (const attack of combine) {
        if (attack.name === request.name) {
          return true;
        }
      }
    });
  },
  UpdateName: (request) => {
    const targetPoke = data.pokemon.find(
      (pokemon) => pokemon.id === request.id
    );
    if (targetPoke !== undefined) {
      targetPoke.name = request.input;
    }
    return targetPoke;
  },
  AddPokemon: (request) => {
    let newID = data.pokemon.length + 1;
    const newPoke = {
      name: request.name,
      type: request.type,
      resistant: request.resistant,
      id: newID,
    };
    data.pokemon.push(newPoke);
    return newPoke;
  },
  DeletePokemon: (request) => {
    for (const index in data.pokemon) {
      if (data.pokemon[index].id === request.id) {
        data.pokemon.splice(index, 1);
      }
    }
    return data.pokemon;
  },
  AddType: (request) => {
    const newType = request.name;
    data.types.push(newType);
    return data.types;
  },
  UpdateType: (request) => {
    for (const index in data.types) {
      if (data.types[index] === request.name) {
        data.types[index] = request.change;
      }
    }
    return data.types;
  },
  AddFastAttack: (request) => {
    const newPoke = {
      name: request.name,
      type: request.type,
      damage: request.damage,
    };
    data.attacks.fast.push(newPoke);
    console.log(data.attacks.fast);
    return request.attacks;
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

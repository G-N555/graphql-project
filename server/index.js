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
    weight: scale
    height: scale
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
    fast: [attackType]
    special: [attackType]
  }
  type attackType {
    name: String
    type: String
    damage: Int
  }
  input inputAttack {
    name: String
    type: String
    damage: Int
  }
  type scale {
    minimum: String!
    maximum: String!
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(id: String!): Pokemon
    MaximumHeight(maxHeight: Float!): Pokemon
    Attacks(type: String!): [attackType]
    Types: [String]!
    SearchByType(name: String): Pokemon
    SearchByAttack(name: String): Pokemon
  }
  type Mutation {
    UpdateName(id: ID!, input: String!): Pokemon
    AddPokemon(name: String!, type: String!, resistant:[String!]): Pokemon
    DeletePokemon(id: String!): Pokemon
    AddType(name: String): [String!]
    UpdateType(name: String, change: String): [String]
    DeleteType(name: String): [String]
    AddAttack(attackType: String!, name: String!, type: String!, damage:Int) : [attackType]
    UpdateAttack(name: String!, type: String!, input: inputAttack): [attackType]
    DeleteAttack(name: String!, type: String!): [attackType]
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
  Attacks: (request) => {
    if (request.type === "fast") {
      return data.attacks.fast;
    } else if (request.type === "special") {
      return data.attacks.special;
    } else {
      return data.attacks;
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
  DeleteType: (request) => {
    for (const index in data.types) {
      if (data.types[index] === request.name) {
        data.types.splice(index, 1);
      }
    }
    return data.types;
  },
  AddAttack: (request) => {
    const newAttack = {
      name: request.name,
      type: request.type,
      damage: request.damage,
    };
    data.attacks[request.attackType].push(newAttack);
    return data.attacks[request.attackType];
  },
  UpdateAttack: (request) => {
    const baseData = data.attacks[request.type];
    for (const index in baseData) {
      if (baseData[index].name === request.name) {
        baseData[index].name = request.input.name;
        baseData[index].type = request.input.type;
        baseData[index].damage = request.input.damage;
      }
    }
    return baseData;
  },
  DeleteAttack: (request) => {
    const baseData = data.attacks[request.type];
    for (const index in baseData) {
      if (baseData[index].name === request.name) {
        baseData.splice(index, 1);
      }
    }
    return baseData;
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

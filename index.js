const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGO_ATLAS_DB;
const client = new MongoClient(uri, { useNewUrlParser: true });
const { ApolloServer, gql } = require('apollo-server');
const typeDefs = `
  type Query {
    title: String!
    reviews: [Link!]!
  }
  type Link {
    _id: String!
    name: String!
    listing_url: String!    
    beds: Int! 
    room_type : String!
    bedrooms: Float!
  }  
`;

const getReviews = async () => {
  try {
    await client.connect();
    const collection = client.db("sample_airbnb").collection("listingsAndReviews");
    return await collection.find({ beds : 5}).limit(100).toArray();        
  } catch (error) {
    console.error(`Connection error: ${error.stack} on Worker process: ${process.pid}`)
    process.exit(1)
  }
}
const resolvers = {
  Query: {
    title: () => `AirBnb Acomodations`,
    reviews: () => getReviews(),
  },
  Link: {
    _id: (parent) => parent._id,
    name: (parent) => parent.name,
    listing_url: (parent) => parent.listing_url
  }
}
const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
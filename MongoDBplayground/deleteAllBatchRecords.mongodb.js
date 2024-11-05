use('SMIDB');

// Create a new document in the collection.
// db.getCollection('users').insertOne(
//     {
//         "_id": {
//           "$oid": "66e50769bf1256968d35a68d"
//         },
//         "name": "admin",
//         "email": "admin@SMI.com",
//         "password": "$2b$06$Snc9aaJpVscKXA5AZNGd8utazG/xJO93mApEibabW5KMsgK6iuJre",
//         "role": "ADMIN",
//         "createdAt": {
//           "$date": "2024-09-14T03:47:53.031Z"
//         },
//         "updatedAt": {
//           "$date": "2024-09-14T03:47:53.031Z"
//         },
//         "__v": 0
//     }
// );

db.getCollection('batchrecords').deleteMany({});
db.getCollection('batchrecorddatas').deleteMany({});
db.getCollection('fieldvaluehistories').deleteMany({});
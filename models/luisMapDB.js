const documentDB = require ('documentdb');
const documentClient = documentDB.DocumentClient;
const uriFactory = documentDB.UriFactory;
const databaseConfig = 	{
    endpoint: 'https://cuba-cosmos.documents.azure.com:443/',
    primaryKey: '1yWSGexOMZKoaQH6GoNyKeFL5Or2hDNGLME6zncR2uG7ODqbKr812WsXWBb2WBQ2WkAtM05NJLv1HxcxmTQFpg==',
    database: {
        id: 'cuba-db',
    },
    cubadb: {
        id: 'cuba-db',
    },
    collections: {
        LuisMap: {
            id: 'cuba-luismap',
        },
    },
}
const client = new documentClient(databaseConfig.endpoint, { 'masterKey': databaseConfig.primaryKey });

const fetchLuisMapFromDB = function (intent) {
    return new Promise((resolve, reject) => {
        const collectionUrl = uriFactory.createDocumentCollectionUri(databaseConfig.database.id, databaseConfig.collections['LuisMap'].id);
        const querySpec = {
            query: 'SELECT * FROM c WHERE c.id=@id',
            parameters: [{ name: '@id', value: intent }],
            EnableCrossPartitionQuery: true
        };
        const options = { // Query options
            enableCrossPartitionQuery: true
        };
        client.queryDocuments(
            collectionUrl,
            querySpec,
            options
        ).toArray((error, results) => {
            if (error) {
                reject(error);
            }
            else {
                if (results.length > 0) {
                    resolve(results[0]);
                } else {
                    resolve(undefined);
                }
            }
        });
    });
};

module.exports.fetchLuisMapFromDB = fetchLuisMapFromDB;


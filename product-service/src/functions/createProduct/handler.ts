import { formatResponse } from '@libs/api-gateway';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, PutItemCommandInput, 
    TransactWriteItemsCommandInput, TransactWriteItem, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const createProductTS = async (event): Promise<APIGatewayProxyResultV2> => {
    try {
        const body = JSON.parse(event.body);
        const dbClient = new DynamoDBClient({ region: 'us-east-1' });
        const productId = uuidv4();
        const pItem = marshall({id: productId, title:body.title || {}, description: body.description || {}, price: body.price || {}});
        const sItem = marshall({product_id: productId, count:body.count || {}});
        // const command:PutItemCommandInput = { TableName: process.env.TABLE_PRODUCTS, Item: pItem }
        const trCommand:TransactWriteItemsCommandInput = {
            TransactItems: [
                {
                    Put: {
                        Item: pItem,
                        TableName: process.env.TABLE_PRODUCTS
                    }
                },
                {
                    Put: {
                        Item: sItem,
                        TableName: process.env.TABLE_STOCKS
                    }
                }
            ]
        }
        
        return dbClient
            .send(new TransactWriteItemsCommand(trCommand))
            .then((data) => {
                console.log('success', data);
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': 'https://d152oub55dmr4x.cloudfront.net',
                        'Access-Control-Allow-Headers': '*'
                    },
                    body: JSON.stringify({message:'Product created', product: data}),
                }
            })
            .catch((error) => {
                return {
                    statusCode: 500,
                    body: JSON.stringify({message:'Unable to create product', error: error}),
                }
            });
    }
    catch (error) {
        console.error('create products request error', error);
        if (error instanceof Error) {
            return formatResponse({ message: error.message }, 500)
        }
        return formatResponse({ message: "InternalServerError" }, 500)
    }
};



export default createProductTS;

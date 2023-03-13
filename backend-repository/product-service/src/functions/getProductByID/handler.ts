import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatResponse } from '@libs/api-gateway';
import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import mergeArrayObjects from 'src/utils/merge-array';

export type AddProductPathParams = {
    productId: string;
};

const getProductById = async (event): Promise<any> => {
    const dbClient = new DynamoDBClient({ region: 'us-east-1' });
    const command: QueryCommandInput = {
        TableName: process.env.TABLE_PRODUCTS,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames: {
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id": {
                S: event.pathParameters.productId
            }
        }
    }
    return dbClient
        .send(new QueryCommand(command))
        .then((data) => {
            const items = data.Items?.map((item) => unmarshall(item))
            return items;
        })
        .catch((error) => {
            return error
        });
}

const getStockById = async (event): Promise<any> => {
    const dbClient = new DynamoDBClient({ region: 'us-east-1' });
    const command: QueryCommandInput = {
        TableName: process.env.TABLE_STOCKS,
        KeyConditionExpression: "#product_id = :product_id",
        ExpressionAttributeNames: {
            "#product_id": "product_id"
        },
        ExpressionAttributeValues: {
            ":product_id": {
                S: event.pathParameters.productId
            }
        }
    }
    return dbClient
        .send(new QueryCommand(command))
        .then((data) => {
            const items = data.Items?.map((item) => unmarshall(item))
            return items;
        })
        .catch((error) => {
            return error
        });
}

const getProductsByIdTS: ValidatedEventAPIGatewayProxyEvent<AddProductPathParams> = async (event) => {
    try {
        const prods = await getProductById(event);
        const stocks = await getStockById(event);
        if (prods && stocks) {
            var mergedList = mergeArrayObjects(prods, stocks)
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*'
                },
                body: JSON.stringify(mergedList),
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
                error: prods,
            })
        }
    }
    catch (error) {
        console.error('Get product request error', error);
        if (error instanceof Error) {
            return formatResponse({ message: error.message }, 500)
        }
        return formatResponse({ message: "InternalServerError" }, 500)
    }
};

export default getProductsByIdTS;

import { formatResponse } from '@libs/api-gateway';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import mergeArrayObjects from '../../utils/merge-array'

const getProducts = async (): Promise<any> => {
    const dbClient = new DynamoDBClient({ region: 'us-east-1' });
    const command = new ScanCommand({ TableName: process.env.TABLE_PRODUCTS });
    return dbClient
        .send(command)
        .then((data) => {
            const items = data.Items?.map((item) => unmarshall(item))
            return items;
        })
        .catch((error) => {
            return error
        });
}

const getStocks = async (): Promise<any> => {
    const dbClient = new DynamoDBClient({ region: 'us-east-1' });
    const command = new ScanCommand({ TableName: process.env.TABLE_STOCKS });
    return dbClient
        .send(command)
        .then((data) => {
            const items = data.Items?.map((item) => unmarshall(item))
            return items;
        })
        .catch((error) => {
            return error;
        });
}

const getProductsListTS = async (): Promise<APIGatewayProxyResultV2> => {
    try {
        const prods = await getProducts();
        const stocks = await getStocks();
        if (prods && stocks) {
            var mergedList = mergeArrayObjects(prods, stocks)
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'https://d152oub55dmr4x.cloudfront.net',
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
        console.error('Get products list request error', error);
        if (error instanceof Error) {
            return formatResponse({ message: error.message }, 500)
        }
        return formatResponse({ message: "InternalServerError" }, 500)
    }
};



export default getProductsListTS;

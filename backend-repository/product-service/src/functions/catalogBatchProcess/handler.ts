import { SQSEvent, SQSHandler } from 'aws-lambda';
import {
    DynamoDBClient,
    TransactWriteItemsCommandInput, TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand, PublishCommandInput} from '@aws-sdk/client-sns';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {

    try {
        for (const record of event.Records) {
            const body = JSON.parse(record.body);
            const productId = uuidv4();

            const dbClient = new DynamoDBClient({ region: 'us-east-1' });
            
            const pItem = marshall({ id: productId, title: body.title, description: body.description, price: parseInt(body.price) });
            const sItem = marshall({ product_id: productId, count: parseInt(body.count) });

            const trCommand: TransactWriteItemsCommandInput = {
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

            await dbClient.send(new TransactWriteItemsCommand(trCommand)).then(async(data) => {
                const message = {
                    productId: body.id,
                    title: body.title,
                    description: body.description,
                    price: body.price,
                    count: body.count

                }
                await sendMessageToSNS(message);
            });
        }
    }
    catch (error) {
        console.error('create products request error', error);
    }
};

const sendMessageToSNS = async(data) => {

    try {
        const snsClient = new SNSClient({ region: 'us-east-1' });
        // Create publish parameters
        var snsParams: PublishCommandInput = {
            Message: JSON.stringify(data), /* required */
            TopicArn: process.env.TOPIC_ARN
        }
        console.log('snsParams',snsParams);
        await snsClient.send(new PublishCommand(snsParams))
    }
    catch (error) {
        console.error('publishing request error', error);
    }
}

export default catalogBatchProcess;

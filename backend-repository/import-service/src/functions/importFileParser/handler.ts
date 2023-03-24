import {default as csv } from 'csv-parser';
import {
    GetObjectCommandInput, GetObjectCommandOutput, S3Client,
    GetObjectCommand, CopyObjectCommand, CopyObjectCommandInput,
    DeleteObjectCommand, DeleteObjectCommandInput
} from '@aws-sdk/client-s3';
import { SQSClient, GetQueueUrlCommand, SendMessageBatchCommand, SendMessageBatchCommandInput, SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

export const asStream = (response: GetObjectCommandOutput) => { return response.Body as Readable; }

const importFileParser = async (event) => {

    try {
        for (const record of event.Records) {
            const objectName = record.s3.object.key;
            const command: GetObjectCommandInput = {
                Bucket: process.env.BUCKET_NAME,
                Key: objectName,
            };
            const copyCommand: CopyObjectCommandInput = {
                Bucket: process.env.BUCKET_NAME,
                CopySource: process.env.BUCKET_NAME + '/' + objectName,
                Key: record.s3.object.key.replace('uploaded', 'parsed'),
            };
            const deleteCommand: DeleteObjectCommandInput = {
                Bucket: process.env.BUCKET_NAME,
                Key: objectName,
            };
            const client = new S3Client({ region: 'us-east-1' });
            const getObjectResult = await client.send(new GetObjectCommand(command));
            const queue: Array<Record<string, string>> = [];
            asStream(getObjectResult).pipe(csv({separator:';'}))
                .on('data', (data) => { queue.push(data) })
                .on('end', async() => {
                    await functionQueue(queue);
            });
            await client.send(new CopyObjectCommand(copyCommand));
            await client.send(new DeleteObjectCommand(deleteCommand));
        }
        return {
            statusCode: 200,
            body: JSON.stringify({message: 'successfully data parsed and moved to parsed folder'}),
        }
    }
    catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify(err.message),
        }
    }
};

const functionQueue = async(entries) => {
        let finalEntries = [];
        for(const entry of entries) {
            const batchRequestEntry: SendMessageBatchRequestEntry= {
                Id: uuidv4(),
                MessageBody:JSON.stringify(entry),
            }
            finalEntries.push(batchRequestEntry)
        }
    
        var sqs = new SQSClient({region: 'us-east-1'});

        var queueUrlParams = {
            QueueName: process.env.QUEUE_NAME
        };

        console.log('finalEntries',finalEntries)
        var getqueueurl = await sqs.send(new GetQueueUrlCommand(queueUrlParams));
        var queueSendParams: SendMessageBatchCommandInput = {
            QueueUrl: getqueueurl.QueueUrl, Entries: finalEntries
        };

        await sqs.send(new SendMessageBatchCommand(queueSendParams));
}

export default importFileParser;

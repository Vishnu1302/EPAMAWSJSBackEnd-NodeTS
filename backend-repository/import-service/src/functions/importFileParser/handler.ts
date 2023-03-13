import {default as csv } from 'csv-parser';
import {
    GetObjectCommandInput, GetObjectCommandOutput, S3Client,
    GetObjectCommand, CopyObjectCommand, CopyObjectCommandInput,
    DeleteObjectCommand, DeleteObjectCommandInput
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

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
        let results = [];
        const getObjectResult = await client.send(new GetObjectCommand(command));
        await asStream(getObjectResult).pipe(csv({}))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results);
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

export default importFileParser;

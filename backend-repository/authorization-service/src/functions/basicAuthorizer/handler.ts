import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
  
  export const basicAuthorizer = async (
    event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
    try {
        console.log('basicAuthorizer', event);
    const b64auth = event.authorizationToken.split(' ')[1] ?? '';
    console.log('b64auth', b64auth);
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    console.log(Buffer.from(b64auth, 'base64').toString().split(':'));
    const isAuthorized = process.env['vishnu1302'] === password;

    console.log('login details',login, password, process.env[login]);

    let auth = 'Deny';
    if(isAuthorized) {
        auth = 'Allow'
    }
    
    const authResponse = {
        "principalId": event.authorizationToken,
        "policyDocument": {
            "Version": '2012-10-17',
            "Statement": [{
                "Action": "execute-api:Invoke",
                "Resource": [
                    event.methodArn
                    ],
                    "Effect": auth
            }
                ]
        }
    }
    return Promise.resolve(authResponse);
    }
    catch(error) {
        console.log(error)
    }
  };
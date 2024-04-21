import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import gql from 'graphql-tag';
import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { ICredentials } from '@aws-amplify/core';
import { getTemporaryCredentials } from './iam-helper';
import { CognitoIdentityPoolCredentialsFactory } from './cognito-helper';


// Load environment variables from .env file
dotenv.config();
if (!process.env.AWS_REGION) throw new Error('AWS_REGION is not set');
const region = process.env.AWS_REGION;
if (!process.env.GRAPHQL_ENDPOINT) throw new Error('GRAPHQL_ENDPOINT is not set');
const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT;
if (!process.env.USER_POOL_ID) throw new Error('USER_POOL_ID is not set');
const userPoolId = process.env.USER_POOL_ID;
if (!process.env.USER_POOL_WEB_CLIENT_ID) throw new Error('USER_POOL_WEB_CLIENT_ID is not set');
const webClientId = process.env.USER_POOL_WEB_CLIENT_ID;
if (!process.env.IDENTITY_POOL_ID) throw new Error('IDENTITY_POOL_ID is not set');
const identityPoolId = process.env.IDENTITY_POOL_ID;

const factory = new CognitoIdentityPoolCredentialsFactory({
    authRegion: region,
    userPoolId,
    webClientId,
    identityPoolId,
});

const runGraphQLQueryUsingIAMCredentials = async (query: string, credentials: ICredentials) => {
    const client = new AWSAppSyncClient({
        url: graphqlEndpoint,
        region,
        auth: {
            type: AUTH_TYPE.AWS_IAM,
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
            },
        },
        disableOffline: true,
    });

    try {
        const result = await client.query({ query: gql(query)});
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error((error as any)?.networkError?.result?.errors || error);
    }
};

const runGraphQLQuery = async (query: string, iamAuthType: IAM_AUTH_TYPE): Promise<void> => {
    let credentials: ICredentials;
    switch (iamAuthType) {
        case IAM_AUTH_TYPE.PRIVATE:
            credentials = await factory.getAuthRoleCredentials();
            break;
        case IAM_AUTH_TYPE.PUBLIC:
            credentials = await factory.getUnAuthRoleCredentials();
            break;
        case IAM_AUTH_TYPE.CUSTOM:
            credentials = await getTemporaryCredentials();
            break;
        default:
            throw new Error('IAM Auth Type not supported');
    };

    await runGraphQLQueryUsingIAMCredentials(query, credentials);
};

enum IAM_AUTH_TYPE {
    PRIVATE,
    PUBLIC,
    CUSTOM,
};

const main = async(): Promise<void> => {
    /**
     * Update the query and iamAuthType to test different scenarios.
     */
    const query = /* GraphQL */ `
        query MyQuery {
            listPrimaries {
                items {
                    id
                }
            }
        }  
    `;
    const iamAuthType = IAM_AUTH_TYPE.CUSTOM;

    await runGraphQLQuery(query, iamAuthType);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

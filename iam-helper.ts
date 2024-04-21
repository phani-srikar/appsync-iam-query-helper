import AWS from 'aws-sdk';
import { ICredentials } from '@aws-amplify/core';

export const getTemporaryCredentials = async (): Promise<ICredentials> => {
    const sts = new AWS.STS();
    if (!process.env.CUSTOM_ROLE_ARN) throw new Error('CUSTOM_ROLE_ARN is not set');
    const params = {
        RoleArn: process.env.CUSTOM_ROLE_ARN,
        RoleSessionName: 'tempSession',
        DurationSeconds: 3600, // Duration for which the temporary credentials will be valid (max 1 hour)
    };

    const { Credentials } = await sts.assumeRole(params).promise();
    if (!Credentials) throw new Error('Failed to get temporary credentials');
    return {
        accessKeyId: Credentials.AccessKeyId,
        secretAccessKey: Credentials.SecretAccessKey,
        sessionToken: Credentials.SessionToken,
        identityId: 'does not apply',
        authenticated: true,
    };
};

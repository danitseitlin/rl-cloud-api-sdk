import { expect } from 'chai';
import { CloudAPISDK } from '../../src/api';
import { loadArguments } from '../helpers';

const TEST_ARGUMENTS = loadArguments();

const cloudAPIClient = new CloudAPISDK({
    accessKey: TEST_ARGUMENTS.API_ACCESS_KEY,
    secretKey: TEST_ARGUMENTS.API_SECRET_KEY,
    domain: TEST_ARGUMENTS.ENVIRONMENT
});

describe('Testing cloud account', async function() {
    this.timeout(10 * 60 * 1000);
    let cloudAccountId: number = -1;
    it('createCloudAccount', async () => {
        const response = await cloudAPIClient.createCloudAccount({
            name: 'My cloud account',
            accessKeyId: TEST_ARGUMENTS.AWS_ACCESS_ID,
            accessSecretKey: TEST_ARGUMENTS.AWS_SECRET_KEY,
            consoleUsername: 'console-username',
            consolePassword: 'console-password',
            signInLoginUrl: 'sign-in-login-url'
        });
        cloudAccountId = response['resourceId'];
        console.log(`=== cloudAccountId: ${cloudAccountId} ===`);
        expect(cloudAccountId).not.to.eql(undefined, `Cloud account id is ${cloudAccountId}`);
        await cloudAPIClient.waitForCloudAccountStatus(cloudAccountId, 'active');
        const cloudAccount = await cloudAPIClient.getCloudAccount(cloudAccountId);
        expect(cloudAccount.status).to.eql('active', 'Cloud Account status');
    });
    it('getCloudAccounts', async () => {
        const cloudAccounts  = await cloudAPIClient.getCloudAccounts();
        expect(cloudAccounts.length).to.eql(2, 'Cloud accounts count');
    })
    it('getCloudAccount', async () => {
        const cloudAccount = await cloudAPIClient.getCloudAccount(cloudAccountId);
        expect(cloudAccount.status).to.eql('active', 'Cloud Account status');
    });
    it('deleteCloudAccount', async () => {
        await cloudAPIClient.deleteCloudAccount(cloudAccountId);
        await cloudAPIClient.waitForCloudAccountStatus(cloudAccountId, 404);
        const cloudAccount = await cloudAPIClient.getCloudAccount(cloudAccountId);
        expect(cloudAccount['response']['data']['status']).eql(404, 'Cloud account status')
    });
});

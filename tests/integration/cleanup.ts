import { expect } from 'chai';
import { CloudAPISDK, CloudAPISDKParameters } from '../../src/api';
import { loadArguments } from '../helpers';

const TEST_ARGUMENTS = loadArguments();

const cloudAPISDKParameters: CloudAPISDKParameters = {
    accessKey: TEST_ARGUMENTS.API_ACCESS_KEY,
    secretKey: TEST_ARGUMENTS.API_SECRET_KEY,
    domain: TEST_ARGUMENTS.ENVIRONMENT
}

const cloudAPIClient: CloudAPISDK = new CloudAPISDK(cloudAPISDKParameters);
describe('Cleanup', async function() {
    this.timeout(10 * 60 * 1000);
    
    it('Resources cleanup', async () => {
        let subscriptions = await cloudAPIClient.getSubscriptions();
        for(const subscription of subscriptions) {
            const subscriptionId: number = subscription.id;
            console.log(`=== Starting cleanup for subscription ${subscriptionId} ===`);
            let databases = await cloudAPIClient.getDatabases(subscriptionId);
            if(subscription.status !== 'error') {
                for(const database of databases) {
                    const databaseId: number = database.databaseId;
                    console.log(`=== Starting cleanup for database ${databaseId} ===`);
                    await cloudAPIClient.deleteDatabase(subscriptionId, databaseId);
                    await cloudAPIClient.waitForDatabaseStatus(subscriptionId, databaseId, '404');
                    console.log(`=== Finished cleanup for database ${databaseId} ===`);
                }
            }
            databases = await cloudAPIClient.getDatabases(subscriptionId);
            expect(databases.response.data.message).to.eql(`Subscription ${subscriptionId}: no databases found`, `Database non-existence for subscription ${subscriptionId}`);
            await cloudAPIClient.deleteSubscription(subscriptionId);
            await cloudAPIClient.waitForSubscriptionStatus(subscriptionId, '404');
            console.log(`=== Finished cleanup for subscription ${subscriptionId} ===`);
        }
        subscriptions = await cloudAPIClient.getSubscriptions();
        expect(subscriptions.length).to.eql(0, 'Subscriptions count');
    });

    it('Cloud account cleanup', async () => {
        // const subscriptions = await cloudAPIClient.getSubscriptions();
        // if(subscriptions.length === 0) {
        //     let cloudAccounts = await cloudAPIClient.getCloudAccounts();
        //     for(let i = 0; i < cloudAccounts.length; i++) {
        //         const cloudAccountId = cloudAccounts[i]['id'];
        //         if(cloudAccountId !== 1) {
        //             console.log(`=== Starting cleanup for cloud account ${cloudAccountId} ===`);
        //             await cloudAPIClient.deleteCloudAccount(cloudAccountId);
        //             await cloudAPIClient.waitForCloudAccountStatus(cloudAccountId, '404');
        //             const cloudAccount = await cloudAPIClient.getCloudAccount(cloudAccountId);
        //             expect(cloudAccount.status).to.not.eql('active', 'Cloud Account Status');
        //             console.log(`=== Finished cleanup for cloud account ${cloudAccountId} ===`);
        //         }
        //     }
        //     cloudAccounts = await cloudAPIClient.getCloudAccounts();
        //     expect(cloudAccounts.length).to.eql(1, 'Cloud accounts count');
        // }
    });
});
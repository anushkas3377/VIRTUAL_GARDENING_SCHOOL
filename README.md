Virtual Gardening School
Virtual Gardening School is a TypeScript web application designed to simplify the management and discovery of gardens. Users can easily perform CRUD (Create, Read, Update, Delete) operations on gardens while receiving personalized garden recommendations based on their preferences.

Features

Garden Management: Perform CRUD operations on gardens, making it easy to create, read, update, and delete garden information.

Personalized Recommendations: Receive personalized garden recommendations based on user preferences, providing a tailored experience.

User-Friendly Interface: Enjoy a clean and intuitive user interface that simplifies the process of managing and discovering gardens.

You can always refer to The Azle Book for more in-depth documentation.

dfx is the tool you will use to interact with the IC locally and on mainnet. If you don't already have it installed:

npm run dfx_install


Next you will want to start a replica, which is a local instance of the IC that you can deploy your canisters to:

npm run replica_start


If you ever want to stop the replica:

npm run replica_stop


Now you can deploy your canister locally:

npm install
npm run canister_deploy_local


To call the methods on your canister:

npm run canister_call_get_message
npm run canister_call_set_message


If you run the above commands and then call npm run canister_call_get_message you should see:

("Hello world!")


Assuming you have created a cycles wallet and funded it with cycles, you can deploy to mainnet like this:

```bash
npm run canister_deploy_mainnet
<h1 align="center">IPD Block</h1> <br>

## Installation

1. Install Truffle globally.
    ```bash
    npm install -g truffle
    ```

2. Install modules in project root folder
    ```bash
    npm install
    ```

2. Install modules in client folder
    ```bash
    cd client
    npm install
    ```

3. Run the development console.
    ```bash
    truffle develop
    ```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with `truffle`.
    ```bash
    compile
    migrate
    ```

5. Run the next.js server for the front-end. Smart contract changes must be manually recompiled and migrated.
    ```bash
    // Change directory to the front-end folder
    cd client
    // Serves the front-end on http://localhost:3000
    npm run dev
    ```

6. Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.
    ```bash
    // If inside the development console.
    test

    // If outside the development console..
    truffle test
    ```

## Running with MetaMask

Since `truffle develop` exposes the blockchain onto port `9545`, you'll need to add a Custom RPC network of `http://localhost:9545` in your MetaMask to make it work.

## Running with TestRPC

We highly recommend using `truffle develop` over `testrpc`, but if you want to use `testrpc`, there are a couple things you need to do:

- Change Line 6 of `client/lib/getWeb3.js` to use `localhost:8545` instead of `localhost:9545` so we refer to `testrpc` instead of `truffle develop`.
- Run your `testrpc` with the following command (because [reasons](https://github.com/trufflesuite/truffle/issues/660#issuecomment-343066784)):

   ```
   testrpc --gasLimit 6721975 --gasPrice 100000000000
   ```

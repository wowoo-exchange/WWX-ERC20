const { tryCatch, errTypes } = require('./utils');

const WWXToken = artifacts.require('./contracts/WWXToken.sol');

contract("WWX - Owner tests", ([deployer, owner, testAddress]) => {

    let wwx;

    beforeEach("deploying the WWX token", async () => {
        wwx = await WWXToken.new(owner, {from: deployer});
    });

    describe("check if owner set correctly", async () => {

        it("owner set in constructor", async () => {
            let wwxOwner = await wwx.owner();
            assert.strictEqual(wwxOwner, owner);     
        });

    });

    describe("change of token ownership", async () => {

        it("only current owner can transfer ownership", async () => {
            await tryCatch(wwx.transferOwnership(testAddress, {from: deployer}),
                errTypes.revert, "Caller is not owner");
        });
    
        it("cannot set new owner to zero address", async () => {
            await tryCatch(wwx.transferOwnership("0x0000000000000000000000000000000000000000", {from: owner}),
                errTypes.revert, "Owner cannot be set to zero address");
        });

        it("successful ownership transfer emits OwnershipTransferred event", async () => {
            const {logs} = await wwx.transferOwnership(testAddress, {from: owner});
            let newOwner = await wwx.owner();
            assert.equal(newOwner, testAddress);

            assert.equal(logs[0].event, "OwnershipTransferred");
            assert.equal(logs[0].args["oldOwner"], owner);
            assert.equal(logs[0].args["newOwner"], newOwner);
        });
    });

    describe("renouncing token ownership", async () => {

        it("only current owner can renounce token ownerhsip", async () => {
            await tryCatch(wwx.renounceOwnership({from: deployer}),
                errTypes.revert, "Caller is not owner");
        });

        it("successful renouncement emits OwnershipTransferred event with zero address as new owner", async () => {
            const {logs} = await wwx.renounceOwnership({from: owner});
            let newOwner = await wwx.owner();
            assert.equal(newOwner, "0x0000000000000000000000000000000000000000");

            assert.equal(logs[0].event, "OwnershipTransferred");
            assert.equal(logs[0].args["oldOwner"], owner);
            assert.equal(logs[0].args["newOwner"], "0x0000000000000000000000000000000000000000");
        })
    })
})
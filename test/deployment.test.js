const { tryCatch, errTypes } = require('./utils');

const WWXToken = artifacts.require('./contracts/WWXToken.sol');

contract("WWX - Deployment tests", ([deployer, owner, testAddress]) => {

    let wwx;
    const MAX_SUPPLY = 4770799141000000000000000000;

    beforeEach("deploying the WWX token", async () => {
        wwx = await WWXToken.new(owner, {from: deployer});
    });

    describe("correct deployment of WWX token", async () => {

        it("check for name, symbol, decimals and maximum Supply", async () => {
            let _name = await wwx.name();
            assert.equal(_name, "Wowoo Exchange Token");
            let _symbol = await wwx.symbol();
            assert.equal(_symbol, "WWX");
            let _decimals = await wwx.decimals();
            assert.equal(_decimals, 18);
            let _maxSupply = await wwx.maxSupply();
            assert.equal(_maxSupply, MAX_SUPPLY);
        });

        it("check total supply equal max supply", async () => {
            let _totalSupply = await wwx.totalSupply();

            assert.equal(_totalSupply, MAX_SUPPLY);
        });

        it("check owner/issuer balance equal to max supply", async () => {
            let ownerBalance = await wwx.balanceOf(owner);
            assert.equal(ownerBalance, MAX_SUPPLY);
        });

    });



});

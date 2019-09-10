const WWX = artifacts.require("WWXToken");

var owner = null

module.exports = async function(deployer, network, accounts) {
    await deployer;

    console.log('network', network);

    if (network == "development" || network == "rinkeby" || network == "ropsten") {
        owner = "0x88cE9a4BA8F1991d381F7a34a4A8F81444963261";
    }  
    else {
        owner = "0x99fd777545fa1a7b3b2b971030952b80b8111bc3";
    }

    const wwx_impl = await deployer.deploy(WWX, owner, {from: accounts[0]});

}
const { tryCatch, errTypes } = require('./utils');

const WWXToken = artifacts.require('./contracts/WWXToken.sol');

contract("WWX - Functionality tests", ([deployer, owner, testAddress, recipient, anotherAccount]) => {

    let wwx;
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const MAX_SUPPLY = 4770799141000000000000000000;


    beforeEach("deploying the WWX token", async () => {
        wwx = await WWXToken.new(owner, {from: deployer});
    });

    describe("total Supply", async () => {

        it('returns the total amount of tokens - equal to MAX supply', async function () {
            const totalSupply = await wwx.totalSupply()
            assert.equal(totalSupply, MAX_SUPPLY);
        });

    });

    describe('balanceOf', function () {
        describe('when the requested account has no tokens', function () {
          it('returns zero', async function () {
            const balance = await wwx.balanceOf(testAddress)
            assert.equal(balance, 0);
          });
        })

        describe('when the requested account has some tokens', function () {
            it('returns the total amount of tokens', async function () {
              const balance = await wwx.balanceOf(owner);
              assert.equal(balance, MAX_SUPPLY);
            });
          });
    });

    describe('transfer', function () {
        describe('when the recipient is not the zero address', function () {
          const to = recipient
    
          describe('when the sender does not have enough balance', function () {
            const amount = 1;
    
            it('reverts', async function () {
              await tryCatch(wwx.transfer(to, amount, { from: testAddress },
                    errTypes.revert, "ERC20: transfer amount exceeds balance"));
            });
          });
    
          describe('when the sender has enough balance', function () {
            const amount = 1000;
    
            it('transfers the requested amount', async function () {
              await wwx.transfer(to, amount, { from: owner })
    
              const senderBalance = await wwx.balanceOf(owner)
              let bal = MAX_SUPPLY - 1000;
              assert.equal(senderBalance, bal)
    
              const recipientBalance = await wwx.balanceOf(to)
              assert.equal(recipientBalance, amount)
            });
    
            it('emits a transfer event', async function () {
              const { logs } = await wwx.transfer(to, amount, { from: owner })
    
              assert.equal(logs.length, 1)
              assert.equal(logs[0].event, 'Transfer')
              assert.equal(logs[0].args.from, owner)
              assert.equal(logs[0].args.to, to)
              assert.equal(logs[0].args.value, amount)
            });
          });
        });

        describe('when the recipient is the zero address', function () {
            const to = ZERO_ADDRESS
            it('reverts', async function () {
              await tryCatch(wwx.transfer(to, MAX_SUPPLY, { from: owner },
                    errTypes.revert, "ERC20: transfer to the zero address"));
            });
        });
    });

    describe('approve', function () {
        describe('when the spender is not the zero address', function () {
          const spender = recipient
    
          describe('when the sender has enough balance', function () {
            const amount = 1000
    
            it('emits an approval event', async function () {
              const { logs } = await wwx.approve(spender, amount, { from: owner })
    
              assert.equal(logs.length, 1)
              assert.equal(logs[0].event, 'Approval')
              assert.equal(logs[0].args.owner, owner)
              assert.equal(logs[0].args.spender, spender)
              assert.equal(logs[0].args.value, amount)
            })
    
            describe('when there was no approved amount before', function () {
              it('approves the requested amount', async function () {
                await wwx.approve(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, amount)
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, 1, { from: owner })
              })
    
              it('approves the requested amount and replaces the previous one', async function () {
                await wwx.approve(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, amount)
              })
            })
          })
    
          describe('when the sender does not have enough balance', function () {
            const amount = 1
    
            it('emits an approval event', async function () {
              const { logs } = await wwx.approve(spender, amount, { from: testAddress })
    
              assert.equal(logs.length, 1)
              assert.equal(logs[0].event, 'Approval')
              assert.equal(logs[0].args.owner, testAddress)
              assert.equal(logs[0].args.spender, spender)
              assert.equal(logs[0].args.value, amount)
            })
    
            describe('when there was no approved amount before', function () {
              it('approves the requested amount', async function () {
                await wwx.approve(spender, amount, { from: testAddress })
    
                const allowance = await wwx.allowance(testAddress, spender)
                assert.equal(allowance, amount)
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, 1, { from: testAddress })
              })
    
              it('approves the requested amount and replaces the previous one', async function () {
                await wwx.approve(spender, amount, { from: testAddress })
    
                const allowance = await wwx.allowance(testAddress, spender)
                assert.equal(allowance, amount)
              })
            })
          })
        })
    
        describe('when the spender is the zero address', function () {
          const amount = 1000
          const spender = ZERO_ADDRESS
    
          it('reverts', async function () {
            await tryCatch(wwx.approve(spender, amount, { from: owner },
                    errTypes.revert, "ERC20: approve to the zero address"))
          })
        })
      })

    describe('transfer from', function () {
        const spender = recipient
    
        describe('when the recipient is not the zero address', function () {
          const to = anotherAccount
    
          describe('when the spender has enough approved balance', function () {
            beforeEach(async function () {
              await wwx.approve(spender, 1000, { from: owner })
            })
    
            describe('when the owner has enough balance', function () {
              const amount = 1000
    
              it('transfers the requested amount', async function () {
                await wwx.transferFrom(owner, to, amount, { from: spender })
    
                const senderBalance = await wwx.balanceOf(owner)
                let bal = MAX_SUPPLY - 1000;
                assert.equal(senderBalance, bal)
    
                const recipientBalance = await wwx.balanceOf(to)
                assert.equal(recipientBalance, amount)
              })
    
              it('decreases the spender allowance', async function () {
                await wwx.transferFrom(owner, to, amount, { from: spender })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, 0)
              })
    
              it('emits a transfer event', async function () {
                const { logs } = await wwx.transferFrom(owner, to, amount, { from: spender })
    
                assert.equal(logs.length, 2)
                assert.equal(logs[0].event, 'Transfer')
                assert.equal(logs[0].args.from, owner)
                assert.equal(logs[0].args.to, to)
                assert.equal(logs[0].args.value, amount)
              })
            })
    
            describe('when the owner does not have enough balance', function () {
              const amount = 1
    
              it('reverts', async function () {
                await tryCatch(wwx.transferFrom(owner, to, amount, { from: testAddress },
                        errTypes.revert, "ERC20: transfer amount exceeds balance"))
              })
            })
          })
    
          describe('when the spender does not have enough approved balance', function () {
            beforeEach(async function () {
              await wwx.approve(spender, 0, { from: owner })
            })
    
            describe('when the owner has enough balance', function () {
              const amount = 1000
    
              it('reverts', async function () {
                await tryCatch(wwx.transferFrom(owner, to, amount, { from: spender },
                        errTypes.revert, "ERC20: transfer amount exceeds allowance"))
              })
            })
    
            describe('when the owner does not have enough balance', function () {
              const amount = MAX_SUPPLY + 1
    
              it('reverts', async function () {
                await tryCatch(wwx.transferFrom(owner, to, amount, { from: spender },
                        errTypes.revert, "ERC20: transfer amount exceeds balance"))
              })
            })
          })
        })
    
        describe('when the recipient is the zero address', function () {
          const amount = 1000
          const to = ZERO_ADDRESS
    
          beforeEach(async function () {
            await wwx.approve(spender, amount, { from: owner })
          })
    
          it('reverts', async function () {
            await tryCatch(wwx.transferFrom(owner, to, amount, { from: spender },
                    errTypes.revert, "ERC20: transfer to the zero address"))
          })
        })
    })
    
    describe('decrease approval', function () {
        describe('when the spender is not the zero address', function () {
          const spender = recipient
    
          describe('when the sender has enough balance', function () {
            const amount = 1000
    
            describe('when there was no approved amount before', function () {
              it('reverts', async function () {
                await tryCatch(wwx.decreaseAllowance(spender, amount, { from: owner }
                        , errTypes.revert, "ERC20: decreased allowance below zero"))
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, amount+1, { from: owner })
              })
    
              it('emits an approval event', async function () {
                const { logs } = await wwx.decreaseAllowance(spender, amount, { from: owner })
    
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, 'Approval')
                assert.equal(logs[0].args.owner, owner)
                assert.equal(logs[0].args.spender, spender)
                assert.equal(logs[0].args.value, 1)
              })
    
              it('decreases the spender allowance subtracting the requested amount', async function () {
                await wwx.decreaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, 1)
              })
            })
          })
    
          describe('when the sender does not have enough balance', function () {
            const amount = 1000
    
            describe('when there was no approved amount before', function () {
              it('reverts', async function () {
                await tryCatch(wwx.decreaseAllowance(spender, amount, { from: testAddress },
                        errTypes.revert, "ERC20: decreased allowance below zero"))
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, amount+1, { from: owner })
              })
    
              it('emits an approval event', async function () {
                const { logs } = await wwx.decreaseAllowance(spender, amount, { from: owner })
    
                assert.equal(logs.length, 1)
                assert.equal(logs[0].event, 'Approval')
                assert.equal(logs[0].args.owner, owner)
                assert.equal(logs[0].args.spender, spender)
                assert.equal(logs[0].args.value, 1)
              })
    
              it('decreases the spender allowance subtracting the requested amount', async function () {
                await wwx.decreaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, 1)
              })
            })
          })
        })    

        describe('when the spender is the zero address', function () {
            const amount = MAX_SUPPLY
            const spender = ZERO_ADDRESS
      
            it('reverts', async function () {
              await tryCatch(wwx.decreaseAllowance(spender, amount, { from: owner },
                    errTypes.revert, "ERC20: approve to the zero address"))
            })
        })
    })

    describe('increase approval', function () {
        const amount = 1000
    
        describe('when the spender is not the zero address', function () {
          const spender = recipient
    
          describe('when the sender has enough balance', function () {
            it('emits an approval event', async function () {
              const { logs } = await wwx.increaseAllowance(spender, amount, { from: owner })
    
              assert.equal(logs.length, 1)
              assert.equal(logs[0].event, 'Approval')
              assert.equal(logs[0].args.owner, owner)
              assert.equal(logs[0].args.spender, spender)
              assert.equal(logs[0].args.value, amount)
            })
    
            describe('when there was no approved amount before', function () {
              it('approves the requested amount', async function () {
                await wwx.increaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, amount)
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, 1, { from: owner })
              })
    
              it('increases the spender allowance adding the requested amount', async function () {
                await wwx.increaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, 1001)
              })
            })
          })
    
          describe('when the sender does not have enough balance', function () {
            const amount = 1000
    
            it('emits an approval event', async function () {
              const { logs } = await wwx.increaseAllowance(spender, amount, { from: testAddress })
    
              assert.equal(logs.length, 1)
              assert.equal(logs[0].event, 'Approval')
              assert.equal(logs[0].args.owner, testAddress)
              assert.equal(logs[0].args.spender, spender)
              assert.equal(logs[0].args.value, amount)
            })
    
            describe('when there was no approved amount before', function () {
              it('approves the requested amount', async function () {
                await wwx.increaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, amount)
              })
            })
    
            describe('when the spender had an approved amount', function () {
              beforeEach(async function () {
                await wwx.approve(spender, 1, { from: owner })
              })
    
              it('increases the spender allowance adding the requested amount', async function () {
                await wwx.increaseAllowance(spender, amount, { from: owner })
    
                const allowance = await wwx.allowance(owner, spender)
                assert.equal(allowance, 1001)
              })
            })
          })
        })
    
        describe('when the spender is the zero address', function () {
          const spender = ZERO_ADDRESS
    
          it('reverts', async function () {
            await tryCatch(wwx.increaseAllowance(spender, amount, { from: owner },
                    errTypes.revert, "ERC20: approve to the zero address"))
          })
        })
    })
});

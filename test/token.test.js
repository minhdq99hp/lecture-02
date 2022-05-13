const { expect } = require("chai");

describe("Token", () => {
  let owner;
  let token;

  before(async () => {
    [owner] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Test Token", "TEST", 10000);
    await token.deployed();
  });

  it("sets name and symbol when created", async () => {
    expect(await token.name()).to.equal("Test Token");
    expect(await token.symbol()).to.equal("TEST");
  });

  it("mints initialSupply to msg.sender when created", async () => {
    expect(await token.totalSupply()).to.equal(10000);
    expect(await token.balanceOf(owner.address)).to.equal(10000);
  });
});
const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (value) => ethers.utils.parseEther(value.toString());

const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );

const getBalance = ethers.provider.getBalance;

describe("Exchange", async () => {
  let deployer;
  let account1;
  let account2;

  let token;
  let exchange;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    account1 = signers[1];
    account2 = signers[2];

    const tokenFactory = await ethers.getContractFactory("Token");
    token = await tokenFactory.deploy("Test Token", "TEST", toWei(10000));
    await token.deployed();
    
    const exchangeFactory = await ethers.getContractFactory("Exchange");
    exchange = await exchangeFactory.deploy(token.address);
    await exchange.deployed();
  })

  it("adds liquidity", async () => {
    await token.approve(exchange.address, toWei(200));
    await exchange.addLiquidity(toWei(200), { value: toWei(100) });

    expect(await getBalance(exchange.address)).to.equal(toWei(100));
    expect(await exchange.getReserve()).to.equal(toWei(200));
  });

  it("allows zero amounts", async () => {
    await token.approve(exchange.address, 0);
    await exchange.addLiquidity(0, { value: 0 });

    expect(await getBalance(exchange.address)).to.equal(0);
    expect(await exchange.getReserve()).to.equal(0);
  });

  it("returns correct token amount", async () => {
    await token.approve(exchange.address, toWei(2000));
    await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

    let tokensOut = await exchange.getTokenAmount(toWei(1));
    expect(fromWei(tokensOut)).to.equal("1.998001998001998001");

    tokensOut = await exchange.getTokenAmount(toWei(100));
    expect(fromWei(tokensOut)).to.equal("181.818181818181818181");

    tokensOut = await exchange.getTokenAmount(toWei(1000));
    expect(fromWei(tokensOut)).to.equal("1000.0");
  });

  it("returns correct ether amount", async () => {
    await token.approve(exchange.address, toWei(2000));
    await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });

    let ethOut = await exchange.getEthAmount(toWei(2));
    expect(fromWei(ethOut)).to.equal("0.999000999000999");

    ethOut = await exchange.getEthAmount(toWei(100));
    expect(fromWei(ethOut)).to.equal("47.619047619047619047");

    ethOut = await exchange.getEthAmount(toWei(2000));
    expect(fromWei(ethOut)).to.equal("500.0");
  });
});


describe("Exchange.ethToTokenSwap", async () => {
  let token;
  let exchange;
  let account1;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    account1 = signers[1];

    const tokenFactory = await ethers.getContractFactory("Token");
    token = await tokenFactory.deploy("Test Token", "TEST", toWei(10000));
    await token.deployed();
    
    const exchangeFactory = await ethers.getContractFactory("Exchange");
    exchange = await exchangeFactory.deploy(token.address);
    await exchange.deployed();

    await token.approve(exchange.address, toWei(2000));
    await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });
  });

  it("transfers at least min amount of tokens", async () => {
    const userBalanceBefore = await getBalance(account1.address);

    await exchange.connect(account1).ethToTokenSwap(toWei(1.99), { value: toWei(1) });

    const userBalanceAfter = await getBalance(account1.address);
    expect(fromWei(userBalanceAfter - userBalanceBefore)).to.equal(
      "-1.0000649079782113"
    );

    const userTokenBalance = await token.balanceOf(account1.address);
    expect(fromWei(userTokenBalance)).to.equal("1.998001998001998001");

    const exchangeEthBalance = await getBalance(exchange.address);
    expect(fromWei(exchangeEthBalance)).to.equal("1001.0");

    const exchangeTokenBalance = await token.balanceOf(exchange.address);
    expect(fromWei(exchangeTokenBalance)).to.equal("1998.001998001998001999");
  });

  it("fails when output amount is less than min amount", async () => {
    await expect(
      exchange.connect(account1).ethToTokenSwap(toWei(2), { value: toWei(1) })
    ).to.be.revertedWith("insufficient output amount");
  });

  it("allows zero swaps", async () => {
    await exchange.connect(account1).ethToTokenSwap(toWei(0), { value: toWei(0) });

    const userTokenBalance = await token.balanceOf(account1.address);
    expect(fromWei(userTokenBalance)).to.equal("0.0");

    const exchangeEthBalance = await getBalance(exchange.address);
    expect(fromWei(exchangeEthBalance)).to.equal("1000.0");

    const exchangeTokenBalance = await token.balanceOf(exchange.address);
    expect(fromWei(exchangeTokenBalance)).to.equal("2000.0");
  });
});

describe("Exchange.tokenToEthSwap", async () => {
  let token;
  let exchange;
  let account1;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    account1 = signers[1];

    const tokenFactory = await ethers.getContractFactory("Token");
    token = await tokenFactory.deploy("Test Token", "TEST", toWei(10000));
    await token.deployed();
    
    const exchangeFactory = await ethers.getContractFactory("Exchange");
    exchange = await exchangeFactory.deploy(token.address);
    await exchange.deployed();

    await token.transfer(account1.address, toWei(2));
    await token.connect(account1).approve(exchange.address, toWei(2));

    await token.approve(exchange.address, toWei(2000));
    await exchange.addLiquidity(toWei(2000), { value: toWei(1000) });
  });

  it("transfers at least min amount of tokens", async () => {
    const userBalanceBefore = await getBalance(account1.address);

    await exchange.connect(account1).tokenToEthSwap(toWei(2), toWei(0.9));

    const userBalanceAfter = await getBalance(account1.address);
    expect(fromWei(userBalanceAfter - userBalanceBefore)).to.equal("0.9989514604796969");

    const userTokenBalance = await token.balanceOf(account1.address);
    expect(fromWei(userTokenBalance)).to.equal("0.0");

    const exchangeEthBalance = await getBalance(exchange.address);
    expect(fromWei(exchangeEthBalance)).to.equal("999.000999000999001");

    const exchangeTokenBalance = await token.balanceOf(exchange.address);
    expect(fromWei(exchangeTokenBalance)).to.equal("2002.0");
  });

  it("fails when output amount is less than min amount", async () => {
    await expect(
      exchange.connect(account1).tokenToEthSwap(toWei(2), toWei(1.0))
    ).to.be.revertedWith("insufficient output amount");
  });

  it("allows zero swaps", async () => {
    await exchange.connect(account1).tokenToEthSwap(toWei(0), toWei(0));

    const userBalance = await getBalance(account1.address);
    expect(fromWei(userBalance)).to.equal("9999.99859877751808385"); // pay transaction fee

    const userTokenBalance = await token.balanceOf(account1.address);
    expect(fromWei(userTokenBalance)).to.equal("2.0");

    const exchangeEthBalance = await getBalance(exchange.address);
    expect(fromWei(exchangeEthBalance)).to.equal("1000.0");

    const exchangeTokenBalance = await token.balanceOf(exchange.address);
    expect(fromWei(exchangeTokenBalance)).to.equal("2000.0");
  });
});

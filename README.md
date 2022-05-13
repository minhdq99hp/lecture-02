# Lecture 02

## Setup working environment

```bash
npm install
```

Note: chưa có npm thì phải cài nodejs

## Các lệnh cơ bản của Hardhat

```bash
# Dịch các contract có trong thư mục contracts/
npx hardhat compile

# Hiện thông tin về các accounts
npx hardhat accounts

# kiểm thử, chạy các file trong thư mục tests/
npx hardhat test

# chạy file script trong thư mục scripts/
npx hardhat run scripts/[SCRIPT].js
```

## Deploy
Supported networks:
- hardhat
- localhost
- rinkeby

Deploy to hardhat network (will be restarted everytime you run script)
```bash
npx hardhat run --network hardhat scripts/deploy.js
```

Deploy to local network:
```bash
npx hardhat run --network localhost scripts/deploy.js
```

Deploy to Rinkeby network:
```bash
npx hardhat run --network rinkeby scripts/deploy.js
```
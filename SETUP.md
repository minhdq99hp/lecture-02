# SETUP

## Yêu cầu trước khi cài đặt
Sử dụng 1 trong 3 hệ điều hành: Windows, Linux, MacOS

Đới với Linux & MacOS, cần sử dụng Terminal để thực hiện lệnh.
Đối với Windows, cần sử dụng PowerShell để thực hiện lệnh.

## 1. Cài đặt Node.js
Lên trang web của Node.js và tải về phiên bản phù hợp với hệ điều hành của máy: https://nodejs.org/en/download/

Lưu ý: cần cài đặt Node.js v16 (vd: 16.15.0)


## 2. Cài đặt môi trường làm việc

Tạo một thư mục mới. VD: my_project/

```bash
mkdir my_project/
cd my_project/
npm init
```


## 3. Cài đặt thư viện

Cài đặt Hardhat và các thư viện phụ trợ:
```bash
npm install --save-dev hardhat dotenv solc web3
```

Chạy lệnh này để bắt đầu quá trình khởi tạo Hardhat project:
```
npx hardhat
```


Cài đặt bộ thư viện OpenZeppelin:
```bash
npm install @openzeppelin/contracts
```

Tiếp theo, xoá 2 file `contracts/Greeter.sol` và `test/sample-test.js` trong thư mục làm việc.


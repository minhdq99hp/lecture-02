
# Thực hành: Uniswap Clone

## Lý thuyết
Từ khoá: AMM, Price Oraclee, Constant product market maker

Ở bài thực hành sẽ clone Uniswap V1.
- Ở V1 thì chỉ swap được ERC-20 sang ETH. (V2 mới swap được ERC-20 với nhau)

Constant Product Formula: x * y = k

-> (x + delta_x) * (y - delta_y) = k

-> delta_y = (y * delta_x) / (x + delta_x)
-> delta_x = ...

Factory is a registry contract that allows to create exchanges and keeps track of all deployed exchanges, allowing to find exchange address by token address and vice versa.

Exchange contract actually defines exchanging logic. Each pair (eth-token) is deployed as an exchange contract and allows to exchange ether to/from only one token.

-> Trong bài thực hành sẽ đi xây 2 contract: Token.sol, Exchange.sol

## Code

### Tạo Token ERC-20
File: Token.sol


### Tạo Exchange contract
File: Exchange.sol

Đăng ký token cho Exchange (mỗi exchange chỉ sử dụng 1 token duy nhất)
```javascript
contract Exchange {
  address public tokenAddress;

  constructor(address _token) {
    require(_token != address(0), "invalid token address");

    tokenAddress = _token;
  }
}
```

#### Cung cấp thanh khoản:
(người dùng phải approve trước khi chạy đc lệnh transferFrom, xem trong test sẽ rõ)

Gửi cả ETH và ERC-20 token vào trong pool
Lưu ý: đây chỉ là ví dụ đơn giản, addLiquidity sẽ thay đổi giá trị k trong phương trình.


```javascript
function addLiquidity(uint256 _tokenAmount) public payable {
    IERC20 token = IERC20(tokenAddress);
    token.transferFrom(msg.sender, address(this), _tokenAmount);
}
```

Kiểm tra reserve của ERC-20 trong pool:
```javascript
function getReserve() public view returns (uint256) {
    return IERC20(tokenAddress).balanceOf(address(this));
}
```

Kiểm tra giá (on-chain price oracle)
```javascript
function getPrice(uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
    require(inputReserve > 0 && outputReserve > 0, "invalid reserves");
    return (inputReserve * 1000) / outputReserve;
}
```


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title EnergyToken
 * @dev Implementation of ERC-1155 multi-token incentive system for energy efficiency
 * Features temporal decay to encourage sustained efficiency improvements
 */
contract EnergyToken is ERC1155, ERC1155Supply, Ownable {
    using Strings for uint256;
    
    // Token types
    uint256 public constant EFFICIENCY_TOKEN = 0;
    uint256 public constant COMPLIANCE_TOKEN = 1;
    uint256 public constant INNOVATION_TOKEN = 2;
    
    // Token metadata
    string private _baseURI;
    
    // Operator data for temporal decay
    struct OperatorData {
        uint256 lastUpdate;
        uint256 decayRate; // Represented as basis points (10000 = 100%)
    }
    
    // Mapping from operator address to their data
    mapping(address => OperatorData) private operatorData;
    
    // Events
    event TokensAwarded(address indexed operator, uint256 indexed tokenId, uint256 amount);
    event DecayRateUpdated(address indexed operator, uint256 newDecayRate);
    
    /**
     * @dev Constructor
     * @param uri_ Base URI for token metadata
     */
    constructor(string memory uri_) ERC1155(uri_) {
        _baseURI = uri_;
    }
    
    /**
     * @dev Awards tokens to an operator for energy efficiency
     * @param operator Address of the data center operator
     * @param tokenId Type of token to award
     * @param amount Amount of tokens to award
     */
    function awardTokens(
        address operator,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        require(tokenId <= INNOVATION_TOKEN, "Invalid token ID");
        require(amount > 0, "Amount must be positive");
        
        // Initialize operator data if not already set
        if (operatorData[operator].lastUpdate == 0) {
            operatorData[operator] = OperatorData({
                lastUpdate: block.timestamp,
                decayRate: 9990 // Default 0.1% decay per day (99.9% retention)
            });
        } else {
            // Apply decay to existing balance before awarding new tokens
            _applyDecay(operator, tokenId);
        }
        
        // Mint new tokens
        _mint(operator, tokenId, amount, "");
        
        // Update last update timestamp
        operatorData[operator].lastUpdate = block.timestamp;
        
        emit TokensAwarded(operator, tokenId, amount);
    }
    
    /**
     * @dev Sets the decay rate for an operator
     * @param operator Address of the data center operator
     * @param decayRate New decay rate in basis points (10000 = 100%)
     */
    function setDecayRate(address operator, uint256 decayRate) external onlyOwner {
        require(decayRate <= 10000, "Decay rate cannot exceed 100%");
        
        // Initialize operator data if not already set
        if (operatorData[operator].lastUpdate == 0) {
            operatorData[operator] = OperatorData({
                lastUpdate: block.timestamp,
                decayRate: decayRate
            });
        } else {
            // Apply decay to existing balances before changing rate
            for (uint256 i = 0; i <= INNOVATION_TOKEN; i++) {
                _applyDecay(operator, i);
            }
            
            // Update decay rate
            operatorData[operator].decayRate = decayRate;
            operatorData[operator].lastUpdate = block.timestamp;
        }
        
        emit DecayRateUpdated(operator, decayRate);
    }
    
    /**
     * @dev Calculates the effective balance after temporal decay
     * @param operator Address of the data center operator
     * @param tokenId Type of token to check
     * @return The effective balance after decay
     */
    function getEffectiveBalance(address operator, uint256 tokenId) public view returns (uint256) {
        if (operatorData[operator].lastUpdate == 0 || balanceOf(operator, tokenId) == 0) {
            return 0;
        }
        
        uint256 rawBalance = balanceOf(operator, tokenId);
        uint256 daysSinceUpdate = (block.timestamp - operatorData[operator].lastUpdate) / 1 days;
        
        if (daysSinceUpdate == 0) {
            return rawBalance;
        }
        
        // Calculate decay factor: (decayRate/10000)^daysSinceUpdate
        uint256 decayFactor = operatorData[operator].decayRate;
        for (uint256 i = 1; i < daysSinceUpdate; i++) {
            decayFactor = (decayFactor * operatorData[operator].decayRate) / 10000;
        }
        
        // Apply decay factor
        return (rawBalance * decayFactor) / 10000;
    }
    
    /**
     * @dev Gets the operator data
     * @param operator Address of the data center operator
     * @return The operator data struct
     */
    function getOperatorData(address operator) external view returns (OperatorData memory) {
        return operatorData[operator];
    }
    
    /**
     * @dev Sets the base URI for token metadata
     * @param newURI New base URI
     */
    function setURI(string memory newURI) external onlyOwner {
        _baseURI = newURI;
        _setURI(newURI);
    }
    
    /**
     * @dev Returns the URI for a given token ID
     * @param tokenId ID of the token
     * @return URI string
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(_baseURI, tokenId.toString(), ".json"));
    }
    
    /**
     * @dev Internal function to apply decay to a token balance
     * @param operator Address of the data center operator
     * @param tokenId Type of token to apply decay to
     */
    function _applyDecay(address operator, uint256 tokenId) private {
        uint256 effectiveBalance = getEffectiveBalance(operator, tokenId);
        uint256 currentBalance = balanceOf(operator, tokenId);
        
        if (effectiveBalance < currentBalance) {
            // Burn the decayed portion
            _burn(operator, tokenId, currentBalance - effectiveBalance);
        }
    }
    
    // Override required by Solidity for multiple inheritance
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}

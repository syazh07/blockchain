// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserData {
    struct Tourist {
        uint256 id;
        string name;
        bytes32 aadharHash;
        string phone;
        string emergencyContact;
        uint256 tripEnd;
        address wallet;
    }

    uint256 private idCounter = 1;
    Tourist[] public tourists;

    mapping(address => bool) public walletRegistered;
    mapping(bytes32 => bool) public aadharRegistered;

    event TouristRegistered(uint256 id, address wallet);

    function registerTourist(
        string memory name,
        string memory passportOrAadhar,
        string memory phone,
        string memory emergencyContact,
        uint256 tripEnd
    ) public {
        
        require(!aadharRegistered[sha256(abi.encodePacked(passportOrAadhar))], "Aadhaar already registered");
        require(bytes(name).length > 0, "Name required");

        bytes32 hash = sha256(abi.encodePacked(passportOrAadhar));
        uint256 newId = idCounter;
        idCounter++;

        tourists.push(
            Tourist({
                id: newId,
                name: name,
                aadharHash: hash,
                phone: phone,
                emergencyContact: emergencyContact,
                tripEnd: tripEnd,
                wallet: msg.sender
            })
        );

        aadharRegistered[hash] = true;

        emit TouristRegistered(newId, msg.sender);
    }

    function getTouristCount() public view returns (uint256) {
        return tourists.length;
    }

    function getTourist(uint256 index) public view returns (
        uint256, string memory, bytes32, string memory, string memory, uint256, address
    ) {
        require(index < tourists.length, "Invalid index");
        Tourist memory t = tourists[index];
        return (t.id, t.name, t.aadharHash, t.phone, t.emergencyContact, t.tripEnd, t.wallet);
    }
}
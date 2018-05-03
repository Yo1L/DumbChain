var CryptoJS = require("crypto-js");

module.exports = class Block 
{
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash ? hash.toString() : null;

        if (!this.hash) {
            this.hash = Block.computeHash(this);
        }
    }

    // static
    static computeHash(block) 
    {
        return CryptoJS.SHA256(block.index + block.previousHash + block.timestamp + block.data + counter).toString();
    }
}
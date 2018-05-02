class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }

    calculateHash(index, previousHash, timestamp, data) {
        return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    }

    generateNextBlock(data) {
        var previousBlock = getLatestBlock();
        var nextIndex = previousBlock.index + 1;
        var nextTimestamp = new Date().getTime() / 1000;
        var nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, data);

        return new Block(nextIndex, previousBlock.hash, nextTimestamp, data, nextHash);
    }
}
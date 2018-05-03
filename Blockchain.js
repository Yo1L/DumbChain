const Block = require('./Block');
const SyncError = require('./Errors/SyncError');

const BlockchainResponse = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

module.exports = class Blockchain 
{
    constructor() 
    {
        this.blocks = [this.getGenesisBlock()];
    }

    /**
     * create a new block from the data and append it to the blockchain
     * @param {string} data 
     */
    createBlock(data) 
    {
        var previousBlock = this.getLastBlock();
        var nextIndex = previousBlock.index + 1;
        var nextTimestamp = new Date().getTime() / 1000;

        return this.addBlocks([new Block(nextIndex, previousBlock.hash, nextTimestamp, data)]);
    }

    /**
     * append those new blocks to the blockchain
     * @param {array} blocks 
     */
    addBlocks(blocks)
    {
        if (!blocks.length) {
            return false;
        }

        const lastBlock = this.getLastBlock();
        const newBlocks = blocks.sort( (b1, b2) => {b1.index - b2.index});
        const block = newBlocks[newBlocks.length - 1];

        console.log("NEW block.index:" + block.index + " - our latest.index:" + lastBlock.index);

        if (block.index > lastBlock.index) {
            console.log("This new block is behind our chain.");
            if (block.previousHash === lastBlock.hash) {
                console.log("Hash match => block appended");
                if (!this.isBlockValid(block, lastBlock)) {
                    console.log("Invalid block");
                    return false;
                }

                this.blocks.push(block);
                return true;
            }
            else if (newBlocks.length === 1) {
                console.log("This new block is to far away for this blockchain, needs a resync");
                throw new SyncError("This new block is to far away for this blockchain");
            }
            else {
                console.log("this blockchain needs to be replaced");
                return this.replaceChain(newBlocks);
            }   
        }
        else {
            console.log("No need to add this block cause our latest is behind");
        }

        return false;
    }

    /**
     * replace the current blocks with this new one
     * @param {array} blocks 
     */
    replaceChain(blocks)
    {
        if (!blocks.length || blocks.length < this.blocks) {
            console.log("invalid new chain length (shorter than the current one)");
            return false;
        }
        if (!this.isChainValid(blocks)) {
            console.log("Invalid chain cannot replace it");
            return false;
        }

        this.blocks = blocks;

        console.log("Blockchain replaced and up to date !")

        return true;
    }

    /**
     * Check a chain validity
     * @param {array} blocks 
     */
    isChainValid(blocks) 
    {
        if (!blocks.length) {
            console.log("invalid chain length");
            return false;
        }

        if (JSON.stringify(blocks[0]) !== JSON.stringify(this.getGenesisBlock())) {
            console.log("First block does not match genesis block");
            return false;
        }

        for (var i = 1; i < blocks.length; i++) {
            if (!this.isBlockValid(blocks[i], blocks[i-1])) {
                console.log("block.index:" + blocks[i].index + " is invalid");
                return false;
            }
        }

        return true;
    }

    /**
     * Check the validity of a new block and whether it can be appended
     * @param {Block} newBlock 
     * @param {Block} previousBlock 
     */
    isBlockValid(newBlock, previousBlock)
    {
        if (newBlock.index !== (previousBlock.index+1)) {
            console.log("invalid index");
            return false;
        }
        if (newBlock.previousHash !== previousBlock.hash) {
            console.log("invalid previousHash");
            return false;
        }
        if (newBlock.timestamp <= previousBlock.timestamp) {
            console.log("invalid timestamp");
            return false;
        }
        if (newBlock.hash !== Block.computeHash(newBlock)) {
            console.log("invalid hash");
            return false;
        }

        return true;
    }

    /**
     * return the last block (at least the genesis block if the blockchain is empty)
     */
    getLastBlock() 
    {
        return this.blocks.length ? this.blocks[this.blocks.length-1] : null;
    }

    /**
     * return the first block
     */
    getGenesisBlock() {
        return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    }

    /**
     * accessor to get all blocks
     */
    getAllBlocks()
    {
        return this.blocks;
    }
}
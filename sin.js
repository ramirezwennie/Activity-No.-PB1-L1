class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.nonce
        ).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.addDefaultBlocks();
    }

    createGenesisBlock() {
        return new Block(0, '01/01/2024', 'Genesis Block', '0');
    }

    addDefaultBlocks() {
        const sampleUsers = [
            'Mitzie Ponce',
            'Ran Takahashi',
            'Rica Inigo',
            'Yuki Ishikawa',
            'Lee Dayheon'
        ];
        sampleUsers.forEach(name => this.addBlock(name));
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }

    addBlock(data) {
        const newBlock = new Block(
            this.chain.length,
            new Date().toLocaleString(),
            data,
            this.getLatestBlock().hash
        );
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
}

const blockchain = new Blockchain();

const chainEl = document.getElementById('chain');
const statusEl = document.getElementById('status');
const dataInput = document.getElementById('block-data');
const addBlockBtn = document.getElementById('addblockbtn');
const validateBtn = document.getElementById('validateBtn');

function renderChain() {
    chainEl.innerHTML = '';

    blockchain.chain.forEach((block, idx) => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        blockDiv.innerHTML = `
            <p><strong>Block #${block.index}</strong></p>
            <p>Timestamp: ${block.timestamp}</p>
            <p>Data: <span contenteditable="true" data-field="true" data-index="${idx}">${block.data}</span></p>
            <p>Previous Hash: ${block.previousHash}</p>
            <p>Hash: ${block.hash}</p>
            <p>Nonce: ${block.nonce}</p>
        `;
        chainEl.appendChild(blockDiv);
    });

    document.querySelectorAll('[data-field="true"]').forEach(el => {
        el.addEventListener('input', () => {
            const idx = parseInt(el.getAttribute('data-index'), 10);
            blockchain.chain[idx].data = el.innerText;
            updateStatus();
        });
    });
}

function updateStatus() {
    const valid = blockchain.isChainValid();
    statusEl.textContent = valid ? 'chain is valid' : 'chain is INVALID';
    statusEl.className = 'status ' + (valid ? 'valid' : 'invalid');
    renderChain();
}

addBlockBtn.addEventListener('click', () => {
    const value = dataInput.value.trim();
    if (value === '') return;
    blockchain.addBlock(value);
    dataInput.value = '';
    updateStatus();
});

dataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBlockBtn.click();
});

validateBtn.addEventListener('click', updateStatus);

renderChain();
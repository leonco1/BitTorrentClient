import * as tp from "./torrent-parser.js";

export class Pieces
{
    constructor(torrent) {
        function buildPiecesArray() {
            const nPieces = torrent.info.pieces.length / 20;
            const arr = new Array(nPieces).fill(null);
            return arr.map((_, i) => new Array(tp.blocksPerPiece(torrent, i)).fill(false));

        }

        this._requested = buildPiecesArray();
        this._received = buildPiecesArray();
    }
        addRequested(pieceBlock) {
            const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
            this._requested[pieceBlock.index][blockIndex] = true;    }

    addReceived(pieceBlock) {
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
        this._received[pieceBlock.index][blockIndex] = true;
    }

    needed(pieceBlock) {
        if (this.isDone()) {
            this._requested = this._received.map(blocks => blocks.slice());
        }
        const blockIndex = pieceBlock.begin / tp.BLOCK_LEN;
        return !this._requested[pieceBlock.index][blockIndex];
    }

    isDone() {
        return this._received.every(blocks => blocks.every(i => i));
    }

}

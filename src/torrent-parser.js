'use strict'

import * as fs from "fs"
import bencode  from "bencode";
import * as crypto from "crypto";
import  * as bignum from 'bigint-buffer'
export  const BLOCK_LEN=Math.pow(2,14);
export  function  open(filepath)
{
return bencode.decode(fs.readFileSync(filepath));
}
export function pieceLen(torrent, pieceIndex) {
    const totalLength = calculateTotalLength(torrent);
    const piecesLength = BigInt(torrent.info['piece length']);
    const lastPieceLength = totalLength % piecesLength;
    const lastPieceIndex = totalLength / piecesLength;

    return lastPieceIndex === BigInt(pieceIndex) ? lastPieceLength : piecesLength;
}

export function blocksPerPiece(torrent, pieceIndex) {
    const pieceLength = pieceLen(torrent, pieceIndex);
    return Math.ceil(Number(pieceLength) / BLOCK_LEN);
}

export function blockLen(torrent, pieceIndex, blockIndex) {
    const pieceLength = pieceLen(torrent, pieceIndex);

    const lastPieceLength = pieceLength % BigInt(BLOCK_LEN);
    const lastPieceIndex = Number(pieceLength / BigInt(BLOCK_LEN));

    return blockIndex === lastPieceIndex ? Number(lastPieceLength) : BLOCK_LEN;
}


//torrents koristat SHA1 hashing function
export function infoHash(torrent)
{
const info=bencode.encode(torrent.info)
    return crypto.createHash("sha1").update(info).digest()
}

export function size(torrent)
{
    const size=torrent.info.files?torrent.
    info.files.map(file=>file.length).reduce((a,b)=>a+b):torrent.info.length
    return bignum.toBufferBE(size,8)
}

function calculateTotalLength(torrent) {
    const size = torrent.info.files
        ? torrent.info.files.map(file => file.length).reduce((a, b) => a + b)
        : torrent.info.length;

    return BigInt('0x' + Buffer.from(bignum.toBufferBE(size, 8)).toString('hex'));
}

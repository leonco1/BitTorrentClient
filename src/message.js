import {Buffer} from "buffer";
import  * as torrentParser from "./torrent-parser.js"
import * as util from "./util.js";



//handshake: <pstrlen><pstr><reserved><info_hash><peer_id>
//
// pstrlen: string length of <pstr>, as a single raw byte
// pstr: string identifier of the protocol
// reserved: eight (8) reserved bytes. All current implementations use all zeroes.
// peer_id: 20-byte string used as a unique ID for the client.
export function BuildHandshake(torrent)
{
    const buf=Buffer.alloc(68)
    //pstrlen
    buf.writeUInt8(19,0)
    //pstr
    buf.write("BitTorrent protocol",1)
    //reserved
    buf.writeUInt32BE(0,20)
    buf.writeUInt32BE(0,24)
    torrentParser.infoHash(torrent).copy(buf,28)
    util.genId().copy(buf,48)
    return buf

}

export  function KeepAlive()
{
    Buffer.alloc(4)
}
//keep-alive: <len=0000>
//The keep-alive message is a message with zero bytes, specified with the length prefix set to zero
//choke: <len=0001><id=0>
// The choke message is fixed-length and has no payload.
//
// unchoke: <len=0001><id=1>
// The unchoke message is fixed-length and has no payload.
//
// interested: <len=0001><id=2>
// The interested message is fixed-length and has no payload.
//
// not interested: <len=0001><id=3>
// The not interested message is fixed-length and has no payload.
//
// have: <len=0005><id=4><piece index>
export  function buildChoke()
{
    const buf=Buffer.alloc(5)
    //lenght
    buf.writeUInt32BE(1,0)
    //id
    buf.writeUInt8(0,4)
    return buf;
}
export function buildUnchoke()
{
    const buf=Buffer.alloc(5)
    buf.writeUInt32BE(1,0)
    buf.writeUInt8(1,4)
    return buf;
}
export function buildInterested ()
{
    const buf=Buffer.alloc(5)
    buf.writeUInt32BE(1,0)
    buf.writeUInt8(2,4)
    return buf
}
export function buildUninterested()
{
    const buf=Buffer.alloc(5)
    buf.writeUInt32BE(1,0)
    buf.writeUInt8(3,4)
    return buf
}
export  function  buildHave(payload)
{
    const buf=Buffer.alloc(9)
    //length
    buf.writeUInt32BE(5,0)
    buf.writeUInt8(4,4)
    buf.writeUInt32BE(payload,5)
    return buf
}
//bitfield: <len=0001+X><id=5><bitfield>
export  function buildBitfield(bitfield)
{
    const buf=Buffer.alloc(bitfield.length+1+4 )
    buf.writeUInt32BE(bitfield.length+1,0)
    buf.writeUInt8(5,4)
    bitfield.copy(buf,5)
    return buf

}
//request: <len=0013><id=6><index><begin><length>
// The request message is fixed length, and is used to request a block. The payload contains the following information:
//
// index: integer specifying the zero-based piece index
// begin: integer specifying the zero-based byte offset within the piece
// length: integer specifying the requested length.
export function buildRequest(payload)
{
    const buf=Buffer.alloc(17)
    buf.writeUInt32BE(13,0)
    buf.writeUInt8(6,4)
    buf.writeUInt32BE(payload.index,5)
    buf.writeUInt32BE(payload.begin,9)
    buf.writeUInt32BE(payload.length,13)
    return buf;
}
//piece: <len=0009+X><id=7><index><begin><block>
// The piece message is variable length, where X is the length of the block. The payload contains the following information:
//
// index: integer specifying the zero-based piece index
// begin: integer specifying the zero-based byte offset within the piece
// block: block of data, which is a subset of the piece specified by index.
export function buildPiece(payload)
{
    const buf=Buffer.alloc(payload.block.length+13)
    buf.writeUInt32BE(payload.block.length+9,0)
    buf.writeUInt8(7,4)
    buf.writeUInt32BE(payload.index,5)
    buf.writeUInt32BE(payload.begin,9)
    payload.block.copy(buf,13)
    return buf

}
//cancel: <len=0013><id=8><index><begin><length>

export  function buildCancel(payload)
{
    const buf=Buffer.alloc(17)
    buf.writeUInt32BE(13,0)
    buf.writeUInt8(8,4)
    buf.writeUInt32BE(payload.index,5)
    buf.writeUInt32BE(payload.begin,9)
    buf.writeUInt32BE(payload.length,13)
    return buf;
}
//port: <len=0003><id=9><listen-port>
export  function buildPort(payload)
{
    const buf=Buffer.alloc(7)
    buf.writeUInt32BE(3,0)
    buf.writeUInt8(9,4)
    buf.writeInt16BE(payload,5)
    return buf
}
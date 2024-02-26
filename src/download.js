import * as net from "net"
import {Buffer} from "buffer";
import * as tracker from './tracker.js'
import * as message from './message.js'
import {Pieces} from "./Pieces.js";
import  {Queue} from "./Queue.js";

export  function CreateTCPConnection(torrent)
{
    const requested=[];
    tracker.getPeers(torrent,peers=>
    {
        const pieces=new Pieces(torrent)
        peers.forEach(peer=>download(peer,torrent,pieces))
    })
}


function download(peer,torrent,pieces) {

    const socket=new net.Socket
    socket.on("error",console.log)
    socket.connect(peer.port, peer.ip, function () {
        socket.write(Buffer.from('hello world'))
    });
    const queue = new Queue(torrent);
    onWholeMsg(socket,msg=>msgHandler(msg,socket,pieces,queue))
}
function msgHandler(msg,socket,pieces,queue)
{
    if(isHandshake(msg))
    {
        socket.write(message.buildInterested());
    }
    else
    {
        const m=message.parse(msg)
        if(m.id===0) chokeHandler();
        if(m.id===1)unchokeHandler();
        if (m.id === 4) haveHandler(socket, pieces, queue, m.payload);
        if(m.id===5)bitfieldHandler(m.payload)
        if(m.id===7)pieceHandler(m.payload,socket,pieces,queue)
    }
}
function chokeHandler() {  }

function unchokeHandler() {  }

function haveHandler(socket,pieces,queue,payload) {
    const pieceIndex = payload.readUInt32BE(0);
    const queueEmpty = queue.length === 0;
    queue.queue(pieceIndex);
    if (queueEmpty) requestPiece(socket, pieces, queue);
}

function bitfieldHandler(socket,pieces,queue,payload) {
    const queueEmpty=queue.length===0
    payload.forEach((byte,i)=> {
        for (let j = 0; j < 8; j++) {
            if (byte % 2) queue.queue(i * 8 + 7 - j);
            byte = Math.floor(byte / 2);

        }
    })
    if (queueEmpty) requestPiece(socket, pieces, queue);


}

function pieceHandler(payload,socket,requested,queue) {
    queue.shift()
    requestPiece(socket, requested, queue);

}
function requestPiece(socket, pieces, queue) {
    if (queue.choked) return null;

    while (queue.length()) {
        const pieceBlock = queue.deque();
        if (pieces.needed(pieceBlock)) {
            socket.write(message.buildRequest(pieceBlock));
            pieces.addRequested(pieceBlock);
            break;
        }
    }
    }

    function onWholeMsg(socket, callback) {
        let savedBuf = Buffer.alloc(0)
        let handshake = true
        socket.on('data', recvBuf => {

            const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4
            savedBuf = Buffer.concat([savedBuf, recvBuf]);

            while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
                callback(savedBuf.slice(0, msgLen()));
                savedBuf = savedBuf.slice(msgLen());
                handshake = false;
            }
        })
    }

    function isHandshake(msg) {
        return msg.length === msg.readUInt8(0) + 49 &&
            msg.toString('utf8', 1) === "BitTorrent protocol"
    }

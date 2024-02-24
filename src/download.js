import * as net from "net"
import {Buffer} from "buffer";
import * as tracker from './tracker.js'
import * as message from './message.js'

export  function CreateTCPConnection(torrent)
{
    const requested=[];
    tracker.getPeers(torrent,peers=>
    {
        peers.forEach(peer=>download(peer,torrent,requested))
    })
}


function download(peer,torrent,requested) {

    const socket=new net.Socket
    socket.on("error",console.log)
    socket.connect(peer.port, peer.ip, function () {
        socket.write(Buffer.from('hello world'))
    })
    const queue=[]
    onWholeMsg(socket,msg=>msgHandler(msg,socket,requested,queue))
}
function msgHandler(msg,socket,requested,queue)
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
        if(m.id===4)haveHandler(m.payload,socket,requested,queue)
        if(m.id===5)bitfieldHandler(m.payload)
        if(m.id===7)pieceHandler(m.payload,socket,requested,queue)
    }
}
function chokeHandler() {  }

function unchokeHandler() {  }

function haveHandler(payload,socket,requested,queue) {
    const pieceIndex = payload.readUInt32BE(0);
    queue.push()
    if(queue.length===1)
    {
        requestPiece(socket,requested,queue);
    }
    if (!requested[pieceIndex]) {
        socket.write(message.buildRequest());
    }
    requested[pieceIndex] = true;
}

function bitfieldHandler(payload) {  }

function pieceHandler(payload,socket,requested,queue) {
    queue.shift()
    requestPiece(socket, requested, queue);

}
function requestPiece(socket, requested, queue) {
    if (requested[queue[0]]) {
        queue.shift();
    } else {
        // complex arguments
        socket.write(message.buildRequest(pieceIndex));
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

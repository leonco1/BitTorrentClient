import * as net from "net"
import {Buffer} from "buffer";
import * as tracker from './tracker.js'

export  function CreateTCPConnection(torrent)
{
    tracker.getPeers(torrent,peers=>
    {
        peers.forEach(download)
    })
}
function download(peer) {

    const socket=new net.Socket
    socket.on("error",console.log)
    socket.connect(peer.port, peer.ip, function () {
        socket.write(Buffer.from('hello world'))
    })
}

function onWholeMsg(socket,callback)
{
    let savedBuf=Buffer.alloc(0)
    let handshake=true
    socket.on('data',recvBuf=>{

        const msgLen=()=>handshake?savedBuf.readUInt8(0)+49:savedBuf.readInt32BE(0)+4
        savedBuf = Buffer.concat([savedBuf, recvBuf]);

        while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
            callback(savedBuf.slice(0, msgLen()));
            savedBuf = savedBuf.slice(msgLen());
            handshake = false;
            }
    })
}
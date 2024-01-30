import * as net from "net"
import {Buffer} from "buffer";
import * as tracker from '/tracker.js'

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
    socket.on('data', responseBuffer => {
        //TODO Create response buffer
    })
}
import * as dgram from "dgram";
import URLParser from "url"
import * as crypto from "crypto";
import * as util from "./util.js";
const buffer=Buffer

export function getPeers (torrent, callback) {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    // 1. send connect request
    udpSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect') {
            // 2. receive and parse connect response
            const connResp = parseConnResp(response);
            // 3. send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce') {
            // 4. parse announce response
            const announceResp = parseAnnounceResp(response);
            // 5. pass peers to callback
            callback(announceResp.peers);
        }
    });
};
function udpSend(socket,message,rawUrl,callback=()=>{})
{
    const url=URLParser.parse(rawUrl)
    socket.send(message,0,message.length,url.port,url.host,callback)

}

function respType(resp) {
    // ...
}
//Connection request mora vaka da izgleda
// Offset  Size            Name            Value
// 0       64-bit integer  connection_id   0x41727101980
// 8       32-bit integer  action          0 // connect
// 12      32-bit integer  transaction_id  ? // random
// 16
function buildConnReq() {
    const buf=buffer.alloc(16)
        //connection_id
    buf.writeUInt32BE(0x417,0)
    buf.writeUInt32BE(0x27101980,4)
    //action
    buf.writeUInt32BE(0,8);
    crypto.randomBytes(4).copy(buf,12);
    return buf;
}
//ParseResponse kako treba da izgleda
//Offset  Size            Name            Value
// 0       32-bit integer  action          0 // connect
// 4       32-bit integer  transaction_id
// 8       64-bit integer  connection_id
// 16

function parseConnResp(resp) {
    return {
        action:resp.readUint32BE(0),
        transactionId:resp.readUint32BE(4),
        connectionId: resp.slice(8)

    }
}


//Offset  Size    Name    Value
// 0       64-bit integer  connection_id
// 8       32-bit integer  action          1 // announce
// 12      32-bit integer  transaction_id
// 16      20-byte string  info_hash
// 36      20-byte string  peer_id
// 56      64-bit integer  downloaded
// 64      64-bit integer  left
// 72      64-bit integer  uploaded
// 80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
// 84      32-bit integer  IP address      0 // default
// 88      32-bit integer  key             ? // random
// 92      32-bit integer  num_want        -1 // default
// 96      16-bit integer  port            ? //
// 98


function buildAnnounceReq(connId,torrent,port=6881) {
    //specs za portite na bittorent mora da bida >=6881 && <=6889

    const buf=Buffer.allocUnsafe(98)
    // connection id
    connId.copy(buf,0)
    // action
    buf.writeUInt32BE(1,8)
    // transaction id
    crypto.randomBytes(4).copy(buf,12)
    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    // peerId
    util.genId().copy(buf,36)
    // downloaded
    Buffer.alloc(8).copy(buf,56)
    // left
    torrentParser.size(torrent).copy(buf,64)
    // uploaded
    Buffer.alloc(8).copy(buff,72)
    // event
    buf.writeUInt32BE(0,80)
    // ip address
    buf.writeUInt32BE(0,84)
    // key
    crypto.randomBytes(4).copy(buf,88)
    //num want
    buf.writeInt32BE(-1,92)
    //port
    buf.writeUInt32BE(port,96)

    return buf
}

//Offset      Size            Name            Value
// 0           32-bit integer  action          1 // announce
// 4           32-bit integer  transaction_id
// 8           32-bit integer  interval
// 12          32-bit integer  leechers
// 16          32-bit integer  seeders
// 20 + 6 * n  32-bit integer  IP address
// 24 + 6 * n  16-bit integer  TCP port
// 20 + 6 * N

function parseAnnounceResp(resp) {
    function  group(iterable,groupSize)
    {
        let groups=[]
        for(let i=0;i<iterable.length;i+=groupSize)
        {
            groups.push(iterable.slice(i,i+groupSize));
        }
        return groups;
    }
    return {
        action:resp.readUint32BE(0),
        transactionId:resp.readUint32BE(4),
        leechers:resp.readUint32BE(8),
        seeders:resp.readUint32BE(12),
        peers:group(resp.slice(20),6).map(address=>
        {
            return {
                ip:address.slice(0,4).join(','),
                port:address.readUint16BE(4)
            }
        })

    }
}

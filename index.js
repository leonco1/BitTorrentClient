'use strict';
import * as fs from 'fs';
import bencode from 'bencode'
import * as dgram from "dgram";
import URLParser from "url"
import * as tracker  from "./src/tracker.js";
import  * as torrentParser from './src/torrent-parser.js'
import * as download from './src/download.js'
import {Buffer} from "buffer";
import {DownloadTorrent} from "./src/download.js";
const torrent=torrentParser.open("706943FD730E841C499A3F649630C962B6DC5D7A.torrent")
tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});
DownloadTorrent(torrent,torrent.info.name);

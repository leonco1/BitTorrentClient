'use strict';
import * as fs from 'fs';
import bencode from 'bencode'
import * as dgram from "dgram";
import URLParser from "url"
import * as tracker  from "./src/tracker.js";
import  * as torrentParser from './src/torrent-parser.js'
const torrent=torrentParser.open("puppy.torrent")
const buffer=Buffer
tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});

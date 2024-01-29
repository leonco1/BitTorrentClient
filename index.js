'use strict';
import * as fs from 'fs';
import bencode from 'bencode'
import * as dgram from "dgram";
import URLParser from "url"
import tracker from "./tracker.js";
const torrent=bencode.decode(fs.readFileSync('puppy.torrent'),'utf8')
const buffer=Buffer
tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});

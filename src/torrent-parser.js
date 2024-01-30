'use strict'

import * as fs from "fs"
import bencode  from "bencode";
import * as crypto from "crypto";
import  * as bignum from 'bigint-buffer'

export  function  open(filepath)
{
return bencode.decode(fs.readFileSync(filepath));
}
//torrents koristat SHA1 hashing function
export function infoHash(torrent)
{
const info=bencode.encode(torrent.info)
    return crypto.createHash("sha1").update(info).digest()
}

export function size(torrent)
{
    const size=torrent.info.files?torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b):torrent.info.length
    return bignum.toBufferBE(size,8)
}
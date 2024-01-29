'use strict'

import * as fs from "fs"
import bencode  from "bencode";
import * as crypto from "crypto";

export  function  open(filepath)
{
return bencode.decode(fs.readFileSync(filepath));
}
//torrents koristat SHA1 hashing function
export  function  size(torrent)
{
const info=bencode.encode(torrent.info)
    return crypto.createHash("sha1").update(info).digest()
}
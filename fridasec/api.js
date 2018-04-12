/**
Copyright (C) 2018
Giovanni -iGio90- Rocca, Vincenzo -rEDSAMK- Greco

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program. If not, see https://www.gnu.org/licenses/
**/

var target = '%%targetModule%%';

if (Process.platform === 'linux') {
    libc = 'libc.so';
} else if (Process.platform === 'darwin') {
    libc = 'libSystem.B.dylib';
} else {
    libc = null;
}

// Native functions references
getpeername = new NativeFunction(Module.findExportByName(libc, "getpeername"), "int", ["int", "pointer", "pointer"]);
getsockname = new NativeFunction(Module.findExportByName(libc, "getsockname"), "int", ["int", "pointer", "pointer"]);
ntohs = new NativeFunction(Module.findExportByName(libc, "ntohs"), "uint16", ["uint16"]);
ntohl = new NativeFunction(Module.findExportByName(libc, "ntohl"), "uint32", ["uint32"]);

// Extensions
backtrace = function() {
    return Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n");
}

getPtr = function(adr) {
    if (target !== null) {
        return ptr(parseInt(target.base) + adr);
    }

    return ptr(adr);
}

mapFd = function(fd, read) {
    if (typeof fd !== 'number') {
        fd = parseInt(fd);
    }
    var message = {};
    var addrlen = Memory.alloc(4);
    var addr = Memory.alloc(16);
    var src_dst = ["src", "dst"];
    for (var i = 0; i < src_dst.length; i++) {
        Memory.writeU32(addrlen, 16);
        if ((src_dst[i] == "src") ^ read) {
            getsockname(fd, addr, addrlen);
        } else {
            getpeername(fd, addr, addrlen);
        }
        message[src_dst[i] + "_port"] = ntohs(Memory.readU16(addr.add(2)));
        message[src_dst[i] + "_addr"] = ntohl(Memory.readU32(addr.add(4)));
    }
    return message;
}

// Short api declarations
bt = backtrace;
hook = Interceptor.attach;
memRead = Memory.readByteArray;
memWrite = Memory.writeByteArray;

setTimeout(function() {
    try {
        target = Process.findModuleByName(target);
    } catch (err) {
        target = null;
    }

    %%script%%
}, %%delay%%)
var target = '%%targetModule%%';

if (Process.platform === 'linux') {
    libc = 'libc.so';
} else if (Process.platform === 'darwin') {
    libc = 'libSystem.B.dylib';
} else {
    libc = null;
}

// Short api declarations
hook = Interceptor.attach;
memRead = Memory.readByteArray;
memWrite = Memory.writeByteArray;

// Native functions references
getpeername = new NativeFunction(Module.findExportByName(libc, "getpeername"), "int", ["int", "pointer", "pointer"]);
getsockname = new NativeFunction(Module.findExportByName(libc, "getsockname"), "int", ["int", "pointer", "pointer"]);
ntohs = new NativeFunction(Module.findExportByName(libc, "ntohs"), "uint16", ["uint16"]);
ntohl = new NativeFunction(Module.findExportByName(libc, "ntohl"), "uint32", ["uint32"]);
getpeername = new NativeFunction(Module.findExportByName(libc, "getpeername"), "int", ["int", "pointer", "pointer"]);
getpeername = new NativeFunction(Module.findExportByName(libc, "getpeername"), "int", ["int", "pointer", "pointer"]);

// Extensions
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

getPtr = function(adr) {
    if (target !== null) {
        return ptr(parseInt(base) + adr);
    }

    return ptr(adr);
}

setTimeout(function() {
    try {
        target = Process.findModuleByName(target);
    } catch (err) {
        target = null;
    }

    %%script%%
}, %%delay%%)
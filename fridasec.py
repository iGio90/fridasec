import codecs
import frida
import sys


class FridaSec(object):
    def __init__(self, target, script, delay=0):
        device = frida.get_usb_device()

        bundle_identifier = None
        pid = None
        for application in device.enumerate_applications():
            if target == application.name:
                bundle_identifier = application.identifier
                pid = application.pid
            elif target == application.identifier:
                bundle_identifier = application.identifier
                pid = application.pid
        if bundle_identifier is None:
            print('[*] App not found')
            sys.exit(0)

        # attach and inject frida script
        print("[*] Attaching to target process")
        if pid == 0:
            pid = device.spawn([bundle_identifier])
        else:
            try:
                device.resume(pid)
            except:
                pass
        process = device.attach(pid)

        print("[*] Injecting script")
        with codecs.open('./api.js', 'r', 'utf-8') as f:
            source = f.read()

        source = source.replace('%%script%%', script)
        source = source.replace('%%delay%%', str(delay))

        self.script = process.create_script(source)
        print("[*] All done. Good luck!")
        self.script.load()

    def get_script(self):
        return self.script

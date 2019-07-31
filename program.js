(function() {
    var _wol = require('wake_on_lan');
    var _express = require('express')();
    var _fs = require('fs');

    const LOG_FILE_PATH = __dirname + '/WOL-Logs.txt';
    const PORT = 1000;
    const WAKE_ENDPOINT = '/wake/:name?/:customResponse?';
    const DEVICES_ENDPOINT = '/devices';

    var _devices = [
        new Device('Server', 'Laptop Server', '7C:05:07:13:B7:BF', '192.168.0.10'),
        new Device('Desktop', 'Leviathan', '70:8B:CD:4E:33:6A', '192.168.0.20')
    ];

    _express.set('json spaces', 4);

    _express.get(WAKE_ENDPOINT, (req, res) => {
        res.set('Content-Type', 'text/html');
        var name = req.params.name;
        if (name === undefined) {
            res.send('<div>Device name not supplied.</div>\n<div>Use "/wake/{name}" and supply the device name.</div>');
            return;
        }

        var device = _devices.filter((device) => {
            return device.name.toLowerCase() === name.toLowerCase();
        })[0];

        if (device === undefined) {
            var html = '<div>Device with name \"' + name + '\" not found.</div>\n';
            html += '<div>See \"' + DEVICES_ENDPOINT + '\" for available devices.';
            res.send(html);
            return;
        }

        _wol.wake(device.mac, (err) => {
            var logText = 'WOL packet sent at: ' + new Date().toISOString().slice(0,10) + '\n-- Device: \"' + device.desc + '\"';
            if (err) {
                var errText = 'There was a WOL error: ' + err;
                res.send(errText);
                logText += '\n' + errText;
            }
            else {
                var customResponse = req.params.customResponse;
                if (customResponse)
                    res.send('<div>' + customResponse + '</div>');
                else
                    res.send('<div>WOL packet sent to \"' + device.desc + '\" with IP \"' + device.ip + '\" and MAC address \"' + device.mac + '\".</div>');
            }

            log(logText);
        });
    });

    _express.get(DEVICES_ENDPOINT, (req, res) => {
        res.send(_devices);
    });

    _express.listen(PORT);

    function Device(name, desc, mac, ip) {
        this.name = name;
        this.desc = desc;
        this.mac = mac;
        this.ip = ip;
    }

    function log(logText) {
        _fs.stat(LOG_FILE_PATH, (err, stats) => {
            if (!stats || stats.size === 0)
                _fs.closeSync(_fs.openSync(LOG_FILE_PATH, 'w'));

            var stream = _fs.createWriteStream(LOG_FILE_PATH, { flags: 'a' });
            stream.write(logText);
            stream.end('\n');
        })
    }
})();
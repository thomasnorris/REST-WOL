(function() {
    var _wol = require('wake_on_lan');
    var _express = require('express')();
    _express.set('json spaces', 4);

    const PORT = 1000;
    const WAKE_ENDPOINT = '/wake/:name?/:customResponse?';
    const DEVICES_ENDPOINT = '/devices';

    var _devices = [
        new Device('Server', 'Old Toshiba Laptop', '7C:05:07:13:B7:BF', '192.168.0.20'),
        new Device('Desktop', 'Leviathan', '70:8B:CD:4E:33:6A', '192.168.0.20')
    ];

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
            if (err)
                res.send('There was a WOL error: ' + err);
            else {
                var customResponse = req.params.customResponse;
                if (customResponse)
                    res.send('<div>' + customResponse + '</div>');
                else
                    res.send('<div>WOL packet sent to \"' + device.desc + '\" with IP \"' + device.ip + '\" and MAC address \"' + device.mac + '\".</div>');
            }
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
})();
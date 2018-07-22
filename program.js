(function() {
    var _wol = require('wake_on_lan');
    var _express = require('express')();

    const PORT = 1000;
    const TOSHIBA = new Device('Laptop', 'Toshiba Laptop', '7C:05:07:13:B7:BF');

    var _devices = [TOSHIBA];

    _express.get('/wake/:name?', (req, res) => {
        var name = req.params.name;
        if (name === undefined) {
            res.send(404, 'Device name not supplied.\n/wake/{name}');
            return;
        }

        var device = _devices.filter((device) => {
            return device.nickName.toLowerCase() === name.toLowerCase();
        });

        if (device.length === 0) {
            res.send(404, 'Device with nickname ' + name + ' not found.');
            return;
        }

        // WOL
    });

    _express.listen(PORT);

    function Device(nickName, fullName, mac, ip = '255.255.255.255', port = '9') {
        this.nickName = nickName;
        this.fullName = fullName;
        this.mac = mac;
        this.ip = ip;
        this.port = port;
    }
})();
(function() {
    var _wol = require('wake_on_lan');
    var _express = require('express')();
    _express.set('json spaces', 4);

    const PORT = 1000;
    const WAKE_ENDPOINT = '/wake/:name?';
    const DEVICES_ENDPOINT = '/devices';

    var _devices = [
        new Device('Laptop', 'Toshiba Laptop', '7C:05:07:13:B7:BF')
    ];

    _express.get(WAKE_ENDPOINT, (req, res) => {
        var name = req.params.name;
        if (name === undefined) {
            res.send('Device name not supplied.\n/wake/{name}');
            return;
        }

        var device = _devices.filter((device) => {
            return device.name.toLowerCase() === name.toLowerCase();
        })[0];

        if (device === undefined) {
            res.send('Device with name \"' + name + '\" not found.');
            return;
        }

        _wol.wake(device.mac, (err) => {
            if (err)
                res.send('There was a WOL error: ' + err);
            else
                res.send('WOL packet sent to \"' + device.desc + '\" at address \"' + device.mac + '\".');
        });
    });

    _express.get(DEVICES_ENDPOINT, (req, res) => {
        res.json(_devices);
    });

    _express.listen(PORT);

    function Device(name, desc, mac) {
        this.name = name;
        this.desc = desc;
        this.mac = mac;
    }
})();
(function() {
    var _wol = require('wake_on_lan');
    var _express = require('express')();

    const PORT = 1000;
    const TOSHIBA = new Device('Laptop', 'Toshiba Laptop', '7C:05:07:13:B7:BF');

    var _devices = [TOSHIBA];

    _express.get('/wake/:name?', (req, res) => {
        var name = req.params.name;
        if (name === undefined) {
            res.send('Device name not supplied.\n/wake/{name}');
            return;
        }

        var device = _devices.filter((device) => {
            return device.nickName.toLowerCase() === name.toLowerCase();
        })[0];

        if (device === undefined) {
            res.send('Device with nickname ' + name + ' not found.');
            return;
        }

        _wol.wake(device.mac, (err) => {
            if (err)
                res.send('There was a WOL error: ' + err);
            else
                res.send('WOL packet sent to ' + device.fullName + ' at address ' + device.mac);
        });
    });

    _express.listen(PORT);

    function Device(nickName, fullName, mac) {
        this.nickName = nickName;
        this.fullName = fullName;
        this.mac = mac;
    }
})();
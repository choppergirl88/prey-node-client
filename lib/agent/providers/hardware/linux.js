"use strict";

var
  exec = require('child_process').exec,
  async = require('async');

var data_fields = {
  system: {
    vendor_name: 'Manufacturer',
    model_name: 'Product Name',
    serial_number: 'Serial Number',
    uuid: 'UUID'
  },
  baseboard: {
    mb_vendor: 'Manufacturer',
    mb_model: 'Product Name',
    mb_version: 'Version',
    mb_serial: 'Serial Number'
  },
  chassis: {
    device_type: 'Type'
  },
  bios: {
    bios_vendor: 'Vendor',
    bios_version: 'Version'
  }
};

exports.get_firmware_info = function(callback) {

  var get_value = function(output, string) {
    var regex = new RegExp(string + ": (.*)");
    var matches = output.toString().match(regex);
    if (matches) {
      return matches[1].trim() === '' ? null : matches[1];
    }
    return null;
  };

  var types = Object.keys(data_fields),
      data = {};

  async.parallel(types.map(function(type) {
    return function(done) {

      exec('dmidecode -t ' + type, function(err, stdout) {
        if (err) return done(err);

        var fields = data_fields[type];

        Object.keys(fields).map(function(key) {
          var val = get_value(stdout, fields[key]);
          if (val) {
            data[key] = val.trim();
          }
        });

        done();
      });
    };
  }),
  function(err){
    callback(err, data);
  });
};

exports.valid_nics = function(nics) {
  return nics.filter(function(n) { return n !== "lo0" && n !== "lo" ; });
};

exports.mac_address_for = function(nic_name, callback) {
  var cmd = "ifconfig | grep " + nic_name + " | grep 'HWaddr' | awk '{print $5}'";
  exec(cmd, callback);
};
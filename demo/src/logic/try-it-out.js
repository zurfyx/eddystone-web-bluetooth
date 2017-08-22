import { Eddystone } from 'eddystone-web-bluetooth';

export default function tryItOut() {
  var eddystone = new Eddystone();
  var beacon, service;
  eddystone.request() // Scan for Eddystone beacons.
    .then((newBeacon) => {
      beacon = newBeacon;
      return beacon.connect(); // Connect to the Beacon's GATT service.
    })
    .then((newService) => {
      service = newService;
      return service.isLocked(); // Check if the beacon is locked.
    })
    .then((isLocked) => {
      if (isLocked) {
        return Promise.reject('The beacon is locked. Can\'t write new URL');
      }
      // Beacon's not locked. We can proceed with the recording of the new URL.
      // Keep in mind that the encoded URL must NOT be longer than 18 characters.
      return service.writeUrl('https://goo.gl/XXw2hi');
    })
    .then(() => {
      beacon.disconnect();
      alert('Beacon has been written!');
    });
}
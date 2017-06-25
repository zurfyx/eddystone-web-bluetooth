import constants from './constants';
import { Beacon } from './beacon';

export class Eddystone {

  async request(): Promise<Beacon> {
    const bluetooth: Bluetooth = navigator.bluetooth;
    if (!bluetooth) {
      return Promise.reject('Your browser does not support Web Bluetooth.');
    }
    const requestOptions = { filters: [{ services: [constants.EDDYSTONE_CONFIG_SERVICE_UUID] }] };
    const device = await bluetooth.requestDevice(requestOptions);
    return new Beacon(device);
  }
}

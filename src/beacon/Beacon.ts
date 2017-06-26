import constants from '../constants';
import { BeaconService } from './BeaconService';

export class Beacon {

  constructor(public device: BluetoothDevice) {}

  onDisconnect(listener: (this: this, ev: Event) => any) {
    this.device.addEventListener('gattserverdisconnected', listener);
  }

  async connect(): Promise<BeaconService> {
    if (!this.device.gatt) {
      return Promise.reject('Bluetooth device is probably not a beacon - it does not support GATT');
    }
    const bluetoothGattServer = await this.device.gatt.connect();
    const service = await bluetoothGattServer
      .getPrimaryService(constants.EDDYSTONE_CONFIG_SERVICE_UUID);
    return new BeaconService(service);
  }

  disconnect() : void {
    const gatt: BluetoothRemoteGATTServer | undefined = this.device.gatt;
    if (!(gatt && gatt.connected)) {
      console.warn('Ignored disconnection request. You are not connected!');
      return;
    }
    gatt.disconnect();
  }
}

import constants from '../constants';

enum LOCK_VALUES {
  'LOCKED' = 0x00,
  'UNLOCKED' = 0x01,
  'UNLOCKED AND AUTOMATIC RELOCK DISABLED' = 0x02,
}

export class BeaconService {

  constructor(public service: BluetoothRemoteGATTService) {}

  private async readCharacteristic(uuid: string): Promise<DataView> {
    const characteristic = await this.service.getCharacteristic(uuid);
    return characteristic.readValue();
  }

  async isLocked() {
    const lockUuid = constants.EDDYSTONE_LOCK_STATE_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(lockUuid);
    const val = rawVal.getInt8(0);
    return val === LOCK_VALUES.LOCKED;
  }
}

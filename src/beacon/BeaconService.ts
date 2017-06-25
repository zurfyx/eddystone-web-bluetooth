import constants from '../constants';
import { decodeUrl } from './url';

enum LOCK_VALUES {
  LOCKED = 0x00,
  UNLOCKED = 0x01,
  UNLOCKED_AND_AUTOMATIC_RELOCK_DISABLED = 0x02,
}

enum DATA_VALUES {
  UID = 0x00,
  URL = 0x10,
  TLM = 0x20,
  EID = 0x40,
}

export class BeaconService {

  constructor(public service: BluetoothRemoteGATTService) {}

  private async readCharacteristic(uuid: string): Promise<DataView> {
    const characteristic = await this.service.getCharacteristic(uuid);
    return characteristic.readValue();
  }

  async isLocked(): Promise<boolean> {
    const uuid = constants.EDDYSTONE_LOCK_STATE_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getInt8(0);
    return val === LOCK_VALUES.LOCKED;
  }

  async readUrl(): Promise<string> {
    const uuid = constants.ADV_SLOT_DATA_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const type = rawVal.getInt8(0);
    if (type !== DATA_VALUES.URL) {
      return Promise.reject('Advertised data is not a URL');
    }
    const rawUrl = new DataView(rawVal.buffer, 2); // w/o type.
    return decodeUrl(rawUrl);
  }
}

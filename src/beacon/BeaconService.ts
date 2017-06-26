import constants from '../constants';
import { LOCK_VALUES, DATA_VALUES } from './enums';
import { decodeUrl, encodeUrl } from './url';

export class BeaconService {

  constructor(public service: BluetoothRemoteGATTService) {}

  private async readCharacteristic(uuid: string): Promise<DataView> {
    const characteristic = await this.service.getCharacteristic(uuid);
    return characteristic.readValue();
  }

  private async writeCharacteristic(uuid: string, value: BufferSource): Promise<void> {
    const characteristic = await this.service.getCharacteristic(uuid);
    return characteristic.writeValue(value);
  }

  /**
   * Interval.
   */
  async readInterval(): Promise<number> {
    const uuid = constants.ADVERTISING_INTERVAL_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getUint16(0, false); // Big-Endian.
    return val;
  }

  async writeInterval(ms: number): Promise<void> {
    const uuid = constants.ADVERTISING_INTERVAL_CHARACTERISTIC_UUID;
    const rawMs = new DataView(new ArrayBuffer(2)); // 2 * 8bit
    rawMs.setUint16(0, ms, false);
    return this.writeCharacteristic(uuid, rawMs);
  }

  /**
   * Lock.
   */
  async isLocked(): Promise<boolean> {
    const uuid = constants.EDDYSTONE_LOCK_STATE_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getInt8(0);
    return val === LOCK_VALUES.LOCKED;
  }

  /**
   * URL.
   */
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

  async writeUrl(url: string): Promise<void> {
    const uuid = constants.ADV_SLOT_DATA_CHARACTERISTIC_UUID;
    const raw = encodeUrl(url);
    if (raw.byteLength > 18) {
      return Promise.reject('Encoded URL is longer than 18 bytes');
    }
    const urlBytes = Array.from(Array(raw.byteLength).keys()).map((bytePos) => {
      return raw.getInt8(bytePos);
    });
    const fullBytes = new Int8Array([DATA_VALUES.URL, ...urlBytes]); // With URL type preceding.
    return this.writeCharacteristic(uuid, fullBytes);
  }

  async clearUrl(): Promise<void> {
    const uuid = constants.ADV_SLOT_DATA_CHARACTERISTIC_UUID;
    const clearByte = new Int8Array([0x00]);
    return this.writeCharacteristic(uuid, clearByte);
  }
}

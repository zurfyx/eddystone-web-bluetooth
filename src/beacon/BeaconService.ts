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
   * LOCK
   */

  async isLocked(): Promise<boolean> {
    const uuid = constants.EDDYSTONE_LOCK_STATE_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getUint8(0);
    return val === LOCK_VALUES.LOCKED;
  }

  /**
   * RADIO
   */

  async readRadioTxPower(): Promise<number> {
    const uuid = constants.RADIO_TX_POWER_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getInt8(0);
    return val;
  }

  /**
   * Writes Radio Tx Power.
   * @param dbm Tx power. Values should range between -100 and +20 dBm.
   * If a power is selected that is not supported by the radio, the beacon should select
   * the next highest power supported, or else the maximum power.
   * @see https://github.com/google/eddystone/blob/master/eddystone-url/README.md#tx-power-level
   */
  async writeRadioTxPower(dbm: number): Promise<void> {
    const uuid = constants.RADIO_TX_POWER_CHARACTERISTIC_UUID;
    const dbmByte = new Int8Array([dbm]);
    return this.writeCharacteristic(uuid, dbmByte);
  }

  async readAdvertisedTxPower(): Promise<number> {
    const uuid = constants.ADVANCED_ADVERTISED_TX_POWER_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const val = rawVal.getInt8(0);
    return val;
  }

  async writeAdvertisedTxPower(dbm: number): Promise<void> {
    const uuid = constants.ADVANCED_ADVERTISED_TX_POWER_CHARACTERISTIC_UUID;
    const dbmByte = new Int8Array([dbm]);
    return this.writeCharacteristic(uuid, dbmByte);
  }

  /**
   * URL
   */
  async readUrl(): Promise<string> {
    const uuid = constants.ADV_SLOT_DATA_CHARACTERISTIC_UUID;
    const rawVal = await this.readCharacteristic(uuid);
    const type = rawVal.getUint8(0);
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
      return raw.getUint8(bytePos);
    });
    const fullBytes = new Uint8Array([DATA_VALUES.URL, ...urlBytes]); // With URL type preceding.
    return this.writeCharacteristic(uuid, fullBytes);
  }

  async clearUrl(): Promise<void> {
    const uuid = constants.ADV_SLOT_DATA_CHARACTERISTIC_UUID;
    const clearByte = new Uint8Array([0x00]);
    return this.writeCharacteristic(uuid, clearByte);
  }

  /**
   * MISC
   */

  async factoryReset(): Promise<void> {
    const uuid = constants.ADVANCED_FACTORY_RESET_CHARACTERISTIC_UUID;
    const factoryResetByte = new Uint8Array([0x0B]);
    return this.writeCharacteristic(uuid, factoryResetByte);
  }
}

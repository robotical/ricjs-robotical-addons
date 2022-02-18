// Test RIC AddOns

import { RICAddOnBase, RICAddOnRegistry } from '@robotical/ricjs';
import { RICAddOnCreator } from '@robotical/ricjs/dist/RICAddOnManager';
import { RICRoboticalAddOns } from '../src/RICRoboticalAddons'

class MockAddOnManager implements RICAddOnRegistry {
    addons: RICAddOnBase[] = [];

    registerHWElemType(typeCode: string, typeName: string, addOnFamily: string, factoryFn: RICAddOnCreator): void {
        console.log(`registerHWElemType(${typeCode}, ${typeName}, ${addOnFamily}, ${factoryFn})`);
        this.addons.push(factoryFn(typeCode, typeName, addOnFamily));
    }

}

const addOnManager = new MockAddOnManager();

RICRoboticalAddOns.registerAddOns(addOnManager);

expect(addOnManager.addons.length).toBeGreaterThan(7);

// // Test RICMiniHDLC

// import RICMiniHDLC from '../src/RICMiniHDLC';
// // import RICUtils from '../src/RICUtils';

// test('HDLC simple encode', () => {
//     const hdlc = new RICMiniHDLC();
//     const encodedBuf = hdlc.encode(new Uint8Array([72, 101, 108, 108, 111]));
//     // console.log(RICUtils.bufferToHex(encodedBuf));
//     expect(encodedBuf).toEqual(new Uint8Array([
//         hdlc.FRAME_BOUNDARY_OCTET,
//         72,
//         101,
//         108,
//         108,
//         111,
//         0xda,
//         0xda,
//         hdlc.FRAME_BOUNDARY_OCTET,
//     ]));
// });

// test('HDLC simple decode', () => {
//     const hdlc = new RICMiniHDLC();

//     const testMsg = new Uint8Array(
//         [
//             hdlc.FRAME_BOUNDARY_OCTET,
//             'H'.charCodeAt(0),
//             'e'.charCodeAt(0),
//             'l'.charCodeAt(0),
//             'l'.charCodeAt(0),
//             'o'.charCodeAt(0),
//             0xda,
//             0xda,
//             hdlc.FRAME_BOUNDARY_OCTET,
//         ]);

//     let frameReceived: Uint8Array = new Uint8Array(0);

//     function onHDLCFrame(rxFrame: Uint8Array) {
//         frameReceived = rxFrame;
//     }

//     hdlc.onRxFrame = onHDLCFrame.bind(this);

//     hdlc.addRxBytes(testMsg);

//     expect(frameReceived).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
// });



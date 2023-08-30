import { RICConnector, RICHWElemList, RICHWElemList_Str, RICLog, RICReportMsg } from "@robotical/ricjs";
import { RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR } from "./RICRoboticalAddOns";

// colour sensor commands
const GET_CALIBRATION_COMMAND = (hwElemName: string) => `elem/${hwElemName}/json?cmd=raw&hexWr=104020&numToRd=8&msgKey=1234`;
const GET_COLOUR_SENSOR_READING_COMMAND = (hwElemName: string) => `elem/${hwElemName}/json?cmd=raw&hexWr=&numToRd=5&msgKey=1`;
const CALIBRATE_COMMAND = (hwElemName: string, baseAddr: number, highByte: string, lowByte: string, i: number) =>
    `elem/${hwElemName}/json?cmd=raw&hexWr=ff4040${baseAddr.toString(16)}${highByte}${lowByte}&numToRd=0&msgKey=11${i}`;

export default class ColourSensorManualCalibrator {
    private static _RICConnector: RICConnector;
    private static _isCalibrating = false;


    static async calibrate(_RICConnector: RICConnector): Promise<boolean> {
        this._RICConnector = _RICConnector;
        if (this._isCalibrating) {
            return false;
        }
        this._isCalibrating = true;
        try {
            const names = await this.getColourSensorNames();
            const didGetCalibrate = await this.getCalibration(names);
            const didGetCSReading = await this.getColourSensorReading(names);
            const didGetCalibrate2 = await this.getCalibration(names);
            return didGetCalibrate && didGetCSReading && didGetCalibrate2;
        } catch (e) {
            RICLog.error("Error calibrating colour sensor: " + JSON.stringify(e));
            return false;
        } finally {
            this._isCalibrating = false;
        }
    }

    private static async getColourSensorNames(): Promise<string[]> {
        RICLog.info("\n==== getColourSensorNames ====");
        const names: string[] = [];
        try {
            const hwElemList_Str = await this._RICConnector.getRICMsgHandler()
                .sendRICRESTURL<RICHWElemList_Str>(`hwstatus/strstat/?filterByType=${RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR}`);
            const hwElems = hwElemList_Str.hw;
            let hwElemList;
            if (hwElems.length) {
                if (typeof hwElems[0] !== "object") {
                    // we are on a fw version that doesn't supports strstat
                    hwElemList = await this._RICConnector.getRICMsgHandler().sendRICRESTURL<
                        RICHWElemList
                    >(`hwstatus?filterByType=${RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR}`);
                } else {
                    // we are on the fw version that supports strstat
                    hwElemList = RICHWElemList_Str.expand(hwElemList_Str);
                }
            }

            if (hwElemList?.rslt === "ok" && hwElemList.hw?.length > 0) {
                for (const hwElem of hwElemList.hw) {
                    names.push(hwElem.name);
                }
            }
            RICLog.info("Colour sensor names: " + JSON.stringify(names));
            return names;
        } catch (e) {
            new Error("Error getting colour sensor names: " + JSON.stringify(e));
            return [];
        }
    }

    private static async getCalibration(names: string[]) {
        const REPORT_MSG_KEY = "GET_CALIBRATION";
        const reports: RICReportMsg[] = [];
        this._RICConnector.getRICMsgHandler().reportMsgCallbacksSet(REPORT_MSG_KEY, (report) => {
            reports.push(report);
            RICLog.debug(`Report callback ${JSON.stringify(report)}`);
        });

        // Run command for each hardware element
        for (const hwElemName of names) {
            const command = GET_CALIBRATION_COMMAND(hwElemName);
            await this._RICConnector.getRICSystem().runCommand(command, {});
        }

        // Wait for report messages to be received
        await new Promise((resolve) => setTimeout(resolve, 2000));

        this._RICConnector.getRICMsgHandler().reportMsgCallbacksDelete(REPORT_MSG_KEY);

        if (reports.length === 0) {
            RICLog.info("No reports received");
            return false;
        }

        // Process reports
        for (const report of reports) {
            if (report.hexRd) {
                const dataRead = report.hexRd;
                const clear = parseInt(dataRead.slice(0, 4), 16);
                const red = parseInt(dataRead.slice(4, 8), 16);
                const green = parseInt(dataRead.slice(8, 12), 16);
                const blue = parseInt(dataRead.slice(12, 16), 16);
                RICLog.info("Calibration Report -- " + "clear: " + clear + " red: " + red + " green: " + green + " blue: " + blue);
            }
        }
        return true;
    }

    private static async getColourSensorReading(names: string[]) {
        const REPORT_MSG_KEY = "GET_COLOUR_SENSOR_READING";
        RICLog.info("\n==== getColourSensorReading ====");
        const reports: Array<RICReportMsg> = [];
        this._RICConnector.getRICMsgHandler()
            .reportMsgCallbacksSet(REPORT_MSG_KEY, function (report: RICReportMsg) {
                reports.push(report);
                RICLog.debug(`getHWElemCB Report callback ${JSON.stringify(report)}`);
            });

        for (const hwElemName of names) {
            const command = GET_COLOUR_SENSOR_READING_COMMAND(hwElemName);
            await this._RICConnector.getRICSystem().runCommand(command, {});
        }

        // wait a couple of seconds for any report messages to be received
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // remove report callback
        this._RICConnector
            .getRICMsgHandler()
            .reportMsgCallbacksDelete(REPORT_MSG_KEY);

        if (reports.length === 0) {
            RICLog.info("No reports received");
            return false;
        }

        // process reports
        for (const report of reports) {
            if (report.hexRd) {
                const dataRead = report.hexRd;
                const clear = parseInt(dataRead.slice(2, 4), 16);
                const red = parseInt(dataRead.slice(4, 6), 16);
                const green = parseInt(dataRead.slice(6, 8), 16);
                const blue = parseInt(dataRead.slice(8, 10), 16);
                // RICLog.info("getColourSensorReading", "clear", clear, "red", red, "green", green, "blue", blue);
                RICLog.info("getColourSensorReading -- " + "clear: " + clear + " red: " + red + " green: " + green + " blue: " + blue);
                if (report.elemName) {
                    if (!await this.calibrateCS(report.elemName, { clear, red, green, blue })) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private static async calibrateCS(
        name: string,
        reading: { clear: number; red: number; green: number; blue: number }
    ): Promise<boolean> {
        RICLog.info("\n==== calibrateCS ====");
        let baseAddr = 0x20;
        const channels = [reading.clear, reading.red, reading.green, reading.blue];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            RICLog.info(`Setting 0x${baseAddr.toString(16)} to ${channel}`);
            const highByte = (channel >> 8).toString(16).padStart(2, "0");
            const lowByte = (channel & 0xff).toString(16).padStart(2, "0");
            const command = CALIBRATE_COMMAND(name, baseAddr, highByte, lowByte, i);
            const rslt = await this._RICConnector.getRICSystem().runCommand(command, {});
            RICLog.info("rslt:" + JSON.stringify(rslt));
            if (rslt.rslt !== "ok") {
                RICLog.info("Error setting calibration");
                return false;
            }
            baseAddr += 2;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        return true;
    }
}

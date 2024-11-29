import readFileFromRecord from '@salesforce/apex/ReadFileData.readFileFromRecord';
import sheetjs from '@salesforce/resourceUrl/sheetmin';
import { loadScript } from 'lightning/platformResourceLoader';
import { LightningElement, track, api } from 'lwc';

let XLS = {};
export default class Display_Excel_Data extends LightningElement {
    @track table;
    @api Arrays;
    showTable = false;

    handleClick(event) {
        Promise.all([
            loadScript(this, sheetjs)
        ]).then(() => {
            XLS = XLSX;
            this.readFromFile();
        })
    }

    async readFromFile() {
        let returnVal = await readFileFromRecord();
        let wb = XLS.read(returnVal, { type: 'base64', WTF: false });
        this.table = this.to_json(wb);
        const arrName = Object.values(this.table);
        const array = arrName[0];
        this.Arrays = array;
    }

    to_json(workbook) {
        let result = {};
        let count = 0;
        workbook.SheetNames.forEach(function (sheetName) {
            if (count < 1) {
                var roa = XLS.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                console.log(typeof roa);
                if (roa.length) {
                    result[sheetName] = roa;
                }
                count++;
            }
        });
        //return JSON.stringify(result, 2, 2);
        return result;
    }
    showTableHandler() {
        this.showTable = true;
    }

    get headerRow() {
        return this.Arrays[0];
    }
    get dataRows() {
        return this.Arrays.slice(1);
    }
}
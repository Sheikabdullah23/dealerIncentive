import { LightningElement, api, track } from 'lwc';
import getRecordDetail from '@salesforce/apex/downloadExcel.getCobDeatil';

export default class DownloadExcel extends LightningElement {
  @api recordInfo;
  @track listOfIds = [];
  @track str = '';
  // @track records=[{
  //     name : "vivek", 
  //     age : "21",
  //     phone : "1234567"
  // }];
  @track records = [];
  exportData() {
    // debugger;
    //  this.recordInfoo = this.recordInfo.replace('[','');
    // this.recordInfoo =this.recordInfoo.replace(']','');
    //  console.log('recordInfo===>',this.recordInfoo);
    console.log('recordInfo===>', this.recordInfo);
    console.log('records')
    console.log('export hit');
    // this.recordInfoo = this.recordInfo.replace('[','');
    // this.recordInfoo =this.recordInfoo.replace(']','');
    // var recordIds = this.recordInfoo.split(',');
    // this.recordInfoo =  this.recordInfo;
    //  this.recordInfo.forEach(element => {
    //   this.recordInfoo.push(element);
    //  });
    //console.log('recordIds', recordIds)
    console.log(this.recordInfo);
    for (let index = 0; index < this.recordInfo.length; index++) {
      const element = this.recordInfo[index];
      console.log('element' + index + element)

      if (element == ',' || element == ']') {
        this.listOfIds.push(this.str);
        this.str = '';
        console.log('this.listofid' + this.listOfIds);
      }
      else if (element == ' ' || element == '[' || element == '') {
        continue;
      }
      else {
        this.str = this.str + element;
      }

      console.log('str>>>last' + this.str);
    }
    console.log('this.listOfIds' + this.listOfIds);

    // this.listOfIds.forEach(element => {
    //   console.log('this.listOfIds' + 'elements' >>> + element);
    // });
    getRecordDetail({ cobId: this.listOfIds })
      .then((result) => {
        console.log('recordss>>' + JSON.stringify(result));
        this.records = result;
        console.log('records' + JSON.stringify(this.records));
        this.printTable();
      })
      .catch((error) => {
        console.log('error', error);
      })


  }

  printTable() {
    // Prepare a html table
    let doc = '<table>';
    // Add styles for the table
    doc += '<style>';
    doc += 'table, th, td {';
    doc += '    border: 1px solid black;';
    doc += '    border-collapse: collapse;';
    doc += '}';
    doc += '</style>';
    // Add all the Table Headers
    doc += '<tr>';

    doc += '<th>SERIAL NUMBER</th>'
    doc += '<th>CUSTOMER NAME</th>'
    doc += '<th>ACCOUNT NAME</th>'
    doc += '<th>TYPE</th>'
    doc += '<th>MODEL NAME</th>'
    doc += '<th>Volume</th>'
    doc += '<th>ACTUAL COB REQUEST</th>'
    doc += '<th>TOTAL COB APPROVED</th>'
    doc += '<th>TARGET MARGIN %</th>'
    doc += '<th>DEAL MARGIN</th>'
    doc += '<th>SUBVENTION APPLICABLE</th>'
    doc += '<th>INSURANCE</th>'
    doc += '<th>SEC FREIGHT</th>'
    doc += '<th>FOC-PARTS</th>'
    doc += '<th>2ND/3RD YEAR WARRANTY</th>'
    doc += '<th>ATTACHMENT ISSUED</th>'
    doc += '<th>COST OF CREDIT PERIOD</th>'

    




    doc += '</tr>';
    // Add the data rows
    this.records.forEach(record => {
      console.log('inside');
      doc += '<tr>';
      doc += '<th>' + record.Name + '</th>';
      doc += '<th>' + record.Customer_Name__c + '</th>';
      doc += '<th>' + record.Dealer_Name__r.Name + '</th>'; 
      doc += '<th>' + record.type__c + '</th>';
      doc += '<th>' + record.Model__r.Name + '</th>';
      doc += '<th>' + record.Volume_No_of_Machines__c + '</th>';
      doc += '<th>' + record.Total_COB_Gross_Net_cobValueToJCB__c + '</th>';
      doc += '<th>' + record.Total_COB_Approved_cobValueToJCB__c + '</th>';
      doc += '<th>' + record.Margin_Perc_At_Target__c + '%</th>';
      doc += '<th>' + record.Deal_Margin__c + '%</th>';
      doc += '<th>' + record.Nill_Subvention__c + '</th>';
      doc += '<th>' + record.Insurance_cov_value_to_jcb__c + '</th>';
      doc += '<th>' + record.Secondary_Freight_cob_value_to_jcb__c + '</th>';
      doc += '<th>' + record.FOC_parts_attachment_cobvalue_to_jcb__c + '</th>';
      doc += '<th>' + record.X2nd_Year_3rd_Year_warranty_cobvalue_jcb__c + '</th>';
      doc += '<th>' + record.Attachment_issued_from_Plant__c + '</th>';
      doc += '<th>' + record.Cost_of_credit_period_30_60_90_days__c + '</th>';





      





      doc += '</tr>';
      console.log(doc + 'insidedoc');
    });
    doc += '</table>';
    var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
    let downloadElement = document.createElement('a');
    downloadElement.href = element;
    downloadElement.target = '_self';
    // use .csv as extension on below line if you want to export data as csv
    downloadElement.download = 'sampledata.xls';
    document.body.appendChild(downloadElement);
    downloadElement.click();
    console.log(doc + 'doc');
  }

}
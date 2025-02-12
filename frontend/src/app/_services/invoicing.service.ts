import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {GroupInvoice, InvoiceModel} from "../../models/invoice.model";
import {setVfs} from "../_utils/pdfMakeUtils";

// PDF MAKE IMPORTS
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {GroupInvoiceModel} from "../../models/training.model";
import {ClientModel} from "../../models/client.model";
//
import n2words from 'n2words';
import {StandardInvoice} from "../../models/standardInvoice";
import {TrainingInvoice} from "../../models/trainingInvoice";
import {map, Observable} from "rxjs";

setVfs(pdfFonts.pdfMake.vfs)


@Injectable({
  providedIn: 'root'
})
export class InvoicingService {
  private host: string = "http://192.168.1.12:8888/INVOICING-SERVICE"

  constructor(private http: HttpClient) {
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  formatDateToDDMMYYYY(dateString: string): string {
    // Vérifier que dateString est bien défini et non vide
    if (!dateString) {
      console.error("La chaîne de date est nulle ou indéfinie.");
      return "Date invalide";
    }

    // Tenter de convertir la chaîne en un objet Date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {  // Vérifie si la date est invalide
      console.error("Échec de la conversion en objet Date :", dateString);
      return "Date invalide";
    }

    const day = ('0' + date.getDate()).slice(-2);         // Ajoute un zéro si nécessaire
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Mois de 0 à 11, donc +1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;  // Retourne la date au format "jj/mm/AAAA"
  }


  /************************************************************************/
  public async generateStandardInvoice(invoice: InvoiceModel, productList: any[], client: ClientModel | undefined, reference: string) {
    const backgroundImage = await this.getBase64ImageFromURL('assets/images/papier_entete/papier-galaxy.png');
    const docDefinition = this.createStandardInvoiceDocDefinition(invoice, productList, client, reference, backgroundImage);

    pdfMake.createPdf(docDefinition).open();
  }

  public async generateStandardInvoicePDF(invoice: InvoiceModel, productList: any[], client: ClientModel | undefined, reference: string) {
    const backgroundImage = await this.getBase64ImageFromURL('assets/images/papier_entete/papier-galaxy.png');
    const docDefinition = this.createStandardInvoiceDocDefinition(invoice, productList, client, reference, backgroundImage);

    return new Promise((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        resolve(blob);
      });
    });
  }

  /************************************************************************/
  public async generateGroupsInvoice(invoiceNumber: string, invoice: InvoiceModel, groupList: GroupInvoiceModel[], client: ClientModel) {
    const backgroundImage = await this.getBase64ImageFromURL('assets/images/papier_entete/papier-galaxy.png');
    const docDefinition = this.createGroupInvoiceDocDefinition(invoiceNumber, invoice, groupList, client, backgroundImage);

    pdfMake.createPdf(docDefinition).open();
  }

  public async generateGroupsInvoicePDF(invoiceNumber: string, invoice: InvoiceModel, groupList: GroupInvoiceModel[], client: ClientModel) {
    const backgroundImage = await this.getBase64ImageFromURL('assets/images/papier_entete/papier-galaxy.png');
    const docDefinition = this.createGroupInvoiceDocDefinition(invoiceNumber, invoice, groupList, client, backgroundImage);
    return new Promise((resolve) => {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob) => {
        resolve(blob);
      });
    });
  }

  /********************************************************************************/

  // HTTP REQUESTS
  public saveStandardInvoice(standardInvoice: StandardInvoice) {
    return this.http.post<InvoiceModel>(`${this.host}/invoice/add/standard`, standardInvoice);
  }

  public saveTrainingInvoice(trainingInvoice: TrainingInvoice) {
    return this.http.post<InvoiceModel>(`${this.host}/invoice/add/training`, trainingInvoice);
  }

  public saveGroupsInvoice(groupsInvoice: GroupInvoice) {
    return this.http.post<InvoiceModel>(`${this.host}/invoice/add/group-invoice`, groupsInvoice);
  }

  public getInvoices() {
    return this.http.get<Array<InvoiceModel>>(`${this.host}/invoice/find/all`);
  }

  public getInvoice(idInvoice: number) {
    return this.http.get<InvoiceModel>(`${this.host}/invoice/find/id/${idInvoice}`);
  }

  public findInvoiceNumber(numberInvoice: string) {
    return this.http.get<boolean>(`${this.host}/invoice/find/number/${numberInvoice}`);
  }

  public findInvoiceByNumber(numberInvoice: string) {
    return this.http.get<InvoiceModel>(`${this.host}/invoice/find/byNumber/${numberInvoice}`);
  }

  public updateStandardInvoice(standardInvoice: StandardInvoice) {
    return this.http.put<InvoiceModel>(`${this.host}/invoice/update/standard/${standardInvoice.idInvoice}`, standardInvoice);
  }

  public updateTrainingInvoice(trainingInvoice: TrainingInvoice) {
    return this.http.put<InvoiceModel>(`${this.host}/invoice/update/training/${trainingInvoice.idInvoice}`, trainingInvoice);
  }

  public deleteInvoice(idInvoice: number) {
    return this.http.delete(`${this.host}/invoice/delete/${idInvoice}`);
  }

  public updateInvoiceStatus(formData: FormData) {
    const headers = new HttpHeaders();
    // Make sure datatype is correct like "multipart/form-data"
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.put<InvoiceModel>(`${this.host}/invoice/update/status`, formData, {headers})
  }

  public getNextInvoiceNumber(year: number, month: number): Observable<string> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<{
      invoiceNumber: string
    }>(`${this.host}/invoice/nextInvoiceNumber`, {params}).pipe(map(response => response.invoiceNumber)); // Extraire le numéro de facture de la réponse;
  }

  public updateGroupsInvoice(trainingsInvoice: TrainingInvoice, idInvoice: number) {
    return this.http.put<InvoiceModel>(`${this.host}/invoice/update/group-invoice/${idInvoice}`, trainingsInvoice);
  }

  /***********************************************************************/
  private createStandardInvoiceDocDefinition(
    invoice: InvoiceModel,
    productList: any[],
    client: ClientModel | undefined,
    reference: string,
    backgroundImage: string
  ): any {
    const date = new Date(invoice.createdAt);
    const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;

    let totalAmount = 0;

    const productRows = productList.map((product) => {
      product.total = product.unitPrice * product.quantity;
      totalAmount += product.total;
      return [
        {text: product.name},
        {text: product.quantity},
        {text: product.unitPrice},
        {text: product.total}
      ];
    });

    const totalAmountInWords = n2words(invoice.ttc, {lang: 'fr'});

    const docDefinition: any = {
      info: {
        title: `Facture-${invoice.numberInvoice}`,
        author: 'babaprince',
        subject: 'Bill',
        keyword: 'bill'
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 120],
      background: [{
        image: backgroundImage,
        width: 595,
        height: 842
      }],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 80]
        }
      },
      content: [
        {
          margin: [0, 120, 0, 0],
          columns: [
            [
              {
                text: [
                  {text: "Client : ", fontSize: 15},
                  {text: `${client?.corporateName}`, bold: true, fontSize: 15}
                ]
              },
              {
                text: [
                  {text: "ICE : ", fontSize: 15},
                  {text: `${client?.commonCompanyIdentifier}`, bold: true, fontSize: 15}
                ]
              },
              {
                text: [
                  {text: "Adresse : ", fontSize: 15},
                  {text: `${client?.address}`, bold: true, fontSize: 15}
                ]
              }
            ],
            [
              {
                text: [
                  {text: "Facture N° : ", fontSize: 15},
                  {text: `${reference}`, bold: true, fontSize: 15}
                ]
              },
              {
                text: [
                  {text: "Date : ", fontSize: 15},
                  {text: `${formattedDate}`, bold: true, fontSize: 15}
                ]
              }
            ]
          ]
        },
        {
          margin: [0, 60, 0, 0],
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*'],
            body: [
              [
                {text: 'Désignation', bold: true, style: 'tableHeader'},
                {text: 'Quantité', bold: true, style: 'tableHeader'},
                {text: 'Prix Unitaire', bold: true, style: 'tableHeader'},
                {text: 'Total', bold: true, style: 'tableHeader'}
              ],
              ...productRows,
              [
                {text: 'Total HT', alignment: 'right', colSpan: 3},
                {}, {},
                {text: invoice.ht.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'TVA 20%', alignment: 'right', colSpan: 3},
                {}, {},
                {text: invoice.tva.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'Frais de déplacement', alignment: 'right', colSpan: 3},
                {}, {},
                {text: invoice.travelFees.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'Total TTC', alignment: 'right', colSpan: 3},
                {}, {},
                {
                  text: invoice.ttc.toFixed(2).replace('.', ','),
                  fillColor: '#FF5E0E',
                  color: '#FFF'
                }
              ]
            ]
          }
        },
        {
          margin: [15, 10, 0, 50],
          columns: [
            {
              text: [
                {text: `Arrêtée la présente facture à la somme de `},
                {text: `${totalAmountInWords.toUpperCase()} `, bold: true, italics: true},
                "Dirhams TTC"
              ]
            },
          ],
        },
      ]
    };

    if (invoice.addDeadline) {
      docDefinition.content.push({
        margin: [15, 0, 150, 50],
        columns: [
          {
            text: [
              {text: "Échéance : ", bold: true, decoration: "underline"},
              "Conformément à nos accords, le délai de paiement pour cette facture est de ",
              {text: `${client?.deadline}`, bold: true},
              " jours à compter de la date d'émission."
            ],
            margin: [0, 0, 0, 10]
          }
        ]
      });
    }

    docDefinition.content.push(
      {
        text: 'Yassine DAOUD',
        bold: true,
        alignment: 'right',
        margin: [0, 0, 60, 10]
      },
      {
        text: 'Directeur Général',
        bold: true,
        alignment: 'right',
        margin: [0, 0, 50, 0]
      }
    );

    return docDefinition;
  }  /***********************************************************************/
  private createGroupInvoiceDocDefinition(
    invoiceNumber: string,
    invoice: InvoiceModel,
    groupList: GroupInvoiceModel[],
    client: ClientModel,
    backgroundImage: string
  ): any {
    const date = new Date(invoice.createdAt);
    const formattedDate = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
    const theme = groupList[0].theme;

    // Helper methods for generating rows
    const generateGroupRows = (groups: GroupInvoiceModel[]) =>
      groups.map((group, idx) => {
        let lastGroupDate;
        if (group.groupDates.length > 0 && group.groupDates.some(date => date.trim() !== '')) {
          lastGroupDate = group.groupDates.map((date) =>
            this.formatDateToDDMMYYYY(date)
          ).pop();
        } else {
          lastGroupDate = this.formatDateToDDMMYYYY(group.endDate);
        }
        return `G${idx + 1} : Le ${lastGroupDate}`;
      }).join('\n');

    const generateLocationRows = (groups: GroupInvoiceModel[]) =>
      groups.map(group => `${group.location}`).join('\n');

    const generateStaffRows = (groups: GroupInvoiceModel[]) =>
      groups.map(group => `${group.groupStaff}`).join('\n');

    const generateAmountRows = (groups: GroupInvoiceModel[]) =>
      groups.map(group => `${group.groupAmount.toFixed(2).replace('.', ',')}`).join('\n');

    // Convert total amount to words
    const totalAmountInWords = n2words(invoice.ttc, {lang: 'fr'});

    const docDefinition: any = {
      info: {
        title: `Facture-${invoiceNumber}`,
        author: 'babaprince',
        subject: 'Bill',
        keyword: 'bill'
      },
      pageSize: 'A4',
      pageMargins: [10, 60, 10, 120],
      background: [{
        image: backgroundImage,
        width: 595,
        height: 842
      }],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [0, 15, 0, 80]
        }
      },
      content: [
        // First table with client and invoice details
        {
          margin: [0, 120, 0, 0],
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: [
              [
                {text: 'Entreprise', bold: true, style: 'tableHeader'},
                {text: 'Facture N° : ', bold: true, style: 'tableHeader'},
                {text: 'Date :  ', bold: true, style: 'tableHeader'}
              ],
              [
                [
                  {text: client.corporateName, bold: true, margin: [0, 0, 0, 10]},
                  {text: client.address},
                  {text: `ICE : ${client.commonCompanyIdentifier}`}
                ],
                {text: invoiceNumber, bold: true, alignment: 'center'},
                {text: formattedDate, bold: true, alignment: 'center'}
              ],
            ]
          }
        },
        // Second table with training details
        {
          table: {
            widths: ['auto', 'auto', '*', 70, 60],
            body: [
              [
                {text: 'Thème', border: [true, false, true, true], alignment: 'center'},
                {text: 'Jours réels de formation', border: [true, false, true, true], alignment: 'center'},
                {text: 'Lieu de formation', border: [true, false, true, true], alignment: 'center'},
                {text: 'Nombre de bénéficiaires', border: [true, false, true, true], alignment: 'center'},
                {text: 'Montant HT', border: [true, false, true, true], alignment: 'center'},
              ],
              [
                {text: theme, border: [true, false, true, true]},
                {text: generateGroupRows(groupList), border: [true, false, true, true]},
                {text: generateLocationRows(groupList), border: [true, false, true, true]},
                {text: generateStaffRows(groupList), border: [true, false, true, true], alignment: 'center'},
                {text: generateAmountRows(groupList), border: [true, false, true, true], alignment: 'center'},
              ],
              [
                {text: 'Total HT', alignment: 'right', colSpan: 4},
                {}, {}, {},
                {text: invoice.ht.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'TVA 20%', alignment: 'right', colSpan: 4},
                {}, {}, {},
                {text: invoice.tva.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'Frais de déplacement', alignment: 'right', colSpan: 4},
                {}, {}, {},
                {text: invoice.travelFees.toFixed(2).replace('.', ',')}
              ],
              [
                {text: 'Total TTC', alignment: 'right', colSpan: 4},
                {}, {}, {},
                {
                  text: invoice.ttc.toFixed(2).replace('.', ','),
                  fillColor: '#FF5E0E',
                  color: '#FFF'
                }
              ]
            ]
          }
        },
        // Total amount in words
        {
          margin: [40, 10, 40, 50],
          columns: [
            {
              text: [
                {text: `Arrêtée la présente facture de formation à la somme de `},
                {text: `${totalAmountInWords.toUpperCase()} `, bold: true, italics: true},
                {text: "Dirhams TTC", bold: true},
              ]
            },
          ]
        }
      ]
    };

    // Optional deadline section
    if (invoice.addDeadline) {
      docDefinition.content.push({
        margin: [15, 0, 150, 50],
        columns: [
          {
            text: [
              {text: "Échéance : ", bold: true, decoration: "underline"},
              "Conformément à nos accords, le délai de paiement pour cette facture est de ",
              {text: `${client?.deadline}`, bold: true},
              " jours à compter de la date d'émission."
            ],
            margin: [0, 0, 0, 10]
          }
        ]
      });
    }

    // Signature section
    docDefinition.content.push(
      {
        text: 'Mohammedia',
        bold: true,
        alignment: 'right',
        margin: [0, 0, 65, 20],
      },
      {
        text: 'Yassine DAOUD',
        bold: true,
        alignment: 'right',
        margin: [0, 0, 60, 10]
      },
      {
        text: 'Directeur Général',
        bold: true,
        alignment: 'right',
        margin: [0, 0, 50, 0]
      }
    );

    return docDefinition;
  }
}

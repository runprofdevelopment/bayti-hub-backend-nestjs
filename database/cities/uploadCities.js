const admin = require('firebase-admin')
const { Translate } = require('@google-cloud/translate').v2
const XLSX = require('xlsx')
const config = require('../../config/production')

function readingExcelFile(filePath) {
    try {
        const workbook = XLSX.readFile(filePath);
        return workbook
    } catch (error) {
        throw error
    }
}

async function parseFileExcel(contents) {
    const translate = new Translate({
        projectId: 'used-brands',
        keyFilename: 'production.json' //eg my-proj-0fwewexyz.json
    });
    const target = 'ar'
    try {
        // const workbook = XLSX.read(Buffer.concat(contents), { type: "buffer" })
        const workbook = contents
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const dataList = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
        //const HEADER_COLMUNS_FIELDS = [sheet.A1.v, sheet.B1.v, sheet.C1.v, sheet.D1.v, sheet.E1.v, sheet.F1.v, sheet.G1.v, sheet.H1.v, sheet.I1.v, sheet.J1.v, sheet.K1.v]

        const countries = {}
        let countryIndex = 0


        const parsedData = []
        for (let index in dataList) {
            const record = dataList[index]
            //console.log(record)
            const city = record.city
            const country = record.country
            const country_ar = record.country_ar
            const city_ar = record.city_ar

            const country_object = {
                id: country,
                en: country,
                ar: country_ar
            }

            const city_object = {
                id: city,
                en: city,
                ar: city_ar
            }


            try {
                await admin.firestore()
                .collection('countries').doc(country_object.id)
                .set(country_object, { merge: true })

                await admin.firestore()
                    .collection('countries').doc(country_object.id)
                    .collection('cities').doc(city_object.id)
                    .set(city_object)

            } catch (error) {
                throw error
            }
            console.log(country_object)
            console.log(city_object)

        }


    } catch (err) {
        throw err;
    }
}

// function publishToFirestore(filePath, options) {
//     console.clear();
//     const moment = require('moment')
//     const START_TIME = moment(new Date()).format('hh:mm:ss a')
//     console.log(`                                                                            Start Time at ${START_TIME}\n`);

//     try {
//         //#region [1] Reading file 
//         const file = await this.readingExcelFile(filePath)
//         //#endregion

//         //#region [2] Parse file excel to array of records
//         const records = await this.parseFileExcel(file)
//         const countries = records.countries
//         const cities = records.cities
//         //#endregion

//         //#region [3] Start adding countries to Firestore
//         await this.addCountriesToFirestore(countries, options)
//         //#endregion

//         //#region [4] Start adding cities to Firestore
//         // await this.addCitiesToFirestore(cities, options)
//         //#endregion

//         const END_TIME = moment().format('hh:mm:ss a')
//         console.log(`\n                                 Published Successfully`);
//         // console.log(`                   Time taken is ${minutes} minutes and ${seconds} seconds`);
//         console.log(`\n                                                                            End Time at ${END_TIME}`);
//         return true
//     } catch (error) {
//         console.log(`\n                                 Publish Failed`);
//         console.log(`\n                                                                            End Time at ${moment().format('hh:mm:ss a')}`);
//         throw error
//     }
// }

const workBook = readingExcelFile('worldcities.xlsx')
parseFileExcel(workBook)
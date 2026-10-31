const configuration = require("../../config/production");
configuration.init();
const CollectionRepository = require('../../database/collectionRepository');
const AlgoliaService = require("../algoliaService");

async function clean() {
    const algolia  = new AlgoliaService();
    console.log("Clean");
    const chefsRepository = new CollectionRepository("chefs");
    const thresholdDate = new Date();
    thresholdDate.setMonth(10);
    thresholdDate.setDate(16);

    const chefs = await chefsRepository.listDocuments([
        { key: "address", operator: "==", value: null },
    ]);
    console.log(chefs.length);
    const promises = [];
    for (const chef of chefs) {
        //console.log(chef.id)
        //  console.log(chef.createdAt + chef.address.lat);
      //  promises.push(chefsRepository.editDocument(chef.id, { address: null, city: null }));
        promises.push(algolia.removeChefFromAlgolia(chef));
    }

    await Promise.all(promises);

}

clean();
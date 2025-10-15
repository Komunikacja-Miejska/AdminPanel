export const BaseUrl = 'http://localhost:8011/api';

async function getEndpoint(path)
{
    var req = await axios.get(`${BaseUrl}/${path}`).catch(error => console.error(error));
    return req.data
}

async function postEndpoint(path, body) {
    var req = await axios.post(`${BaseUrl}/${path}`, body).catch(error => console.error(error));
    return req;
}

async function putEndpoint(path, body) {
    var req = await axios.put(`${BaseUrl}/${path}`, body).catch(error => console.error(error));
    return req;
}

async function deleteEndpoint(path){
    var req = await axios.delete(`${BaseUrl}/${path}`).catch(error => console.error(error));
    console.log(req);
}

export const api = {
    //Trasy
    getTrasyAll: async() => await getEndpoint("trasa"),
    addTrasa: async (trasaModel) => await postEndpoint("trasa", trasaModel),
    updateTrasa: async (trasaModel, trasaId) => await putEndpoint(`trasa/${trasaId}`, trasaModel),
    deleteTrasa: async (trasaId) => await deleteEndpoint(`trasa/${trasaId}`),

    //Kursy
    getKursyAll: async(trasaId) => await getEndpoint(`trasa/courses/${trasaId}`),
    addKurs: async(trasaId) => await postEndpoint(`kurs/${trasaId}`),
    updateKurs: async(kursId, trasaId) => await putEndpoint(`kurs/${kursId}?trasaId=${trasaId}`),
    deleteKurs: async(kursId) => await deleteEndpoint(`kurs/${kursId}`),


    //Odjazdy
    getOdjazdyByKursId: async(kursId) => await getEndpoint(`kurs/departures/${kursId}`),
    addOdjazd: async(kursId, przystanekId, godzina) => await postEndpoint(`kurs/${kursId}/add-przystanek/${przystanekId}?godzina=${godzina}`),
    deleteOdjazdById: async(kursId, przystanekId) => await deleteEndpoint(`kurs/${kursId}/delete-przystanek/${przystanekId}`),
    
    //Przystanki
    getPrzystankiAll: async() => await getEndpoint(`przystanek`),
    getPrzystanekById: async(przystanekId) => await getEndpoint(`przystanek/${przystanekId}`),
    addPrzystanek: async(przystanekModel) => await postEndpoint(`przystanek`, przystanekModel),
    updatePrzystanek: async(przystanekId, przystanekModel) => await putEndpoint(`przystanek/${przystanekId}`, przystanekModel),
    deletePrzystanek: async(przystanekId) => await deleteEndpoint(`przystanek/${przystanekId}`)
}
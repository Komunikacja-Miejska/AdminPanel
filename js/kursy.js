import { api } from "./api.js";
import { mapOperations } from "./map.js";


//MAP
function isValidTime(t) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(t); }

async function ShowPrzystankiAll() {
  mapOperations.clear();

  var przystankiJson = await api.getPrzystankiAll();

  przystankiJson.forEach((element) => {
    let marker = mapOperations.addMarker(element.latitude, element.longitude, 
      `
      <div class="addMarkerContainer">
        <p>${element.nazwa} ${element.opis}</p>
        <button class="addMarker" data-id="${element.id}">Dodaj</button>
      </div>
      `
    );
    //Adding odjazd to current kurs 
    marker.on("popupopen", async (e) => {
      let btn = e.popup._contentNode.querySelector(".addMarker");
      btn.addEventListener("click", async () => {
        let przystanekId = btn.dataset.id;
        let godzina = prompt("Podaj godzine (HH:MM)");

        if(!godzina || !isValidTime(godzina))
        {
          alert("Podano niepoprawna godzine. Użyj formatu HH:MM");
          return;
        }

        await api.addOdjazd(currentKurs, przystanekId, godzina);
        await loadOdjazdy(currentKurs);
        editPrzystanki();
      });
    });
    
  });
}
function addMarkerFromKurs(przystanekModel) 
{
  mapOperations.addMarker(
    przystanekModel.latitude,
    przystanekModel.longitude,
    `${przystanekModel.nazwa} ${przystanekModel.opis}`
  )
}
function zoomIntoPrzystanek(lt, lg)
{
  mapOperations.zoomIntoPrzystanek(lt, lg)
}

document.addEventListener("DOMContentLoaded", () => { mapOperations.init("map", [51.76, 18.1], 13); });


//Web Functions

let currentTrasa = null;
let currentKurs = null;
let editMode = false;

//TRASY
async function loadTrasy() {

  mapOperations.clear()

  let trasyList = document.getElementById("trasyList");
  let trasyJson = await api.getTrasyAll();

  trasyList.innerHTML = ``;
  trasyJson.forEach((element) => {
    trasyList.innerHTML += `
                    <li data-id_trasa="${element.id}" data-nazwa="${element.nazwaLinii}" data-opis="${element.opis}">
                        <p>${element.id}</p>
                        <p>${element.nazwaLinii} ${element.opis}</p>
                        <button class="deleteTrasa">✖</button>
                    </li>
                `;
  });

  //Listeners
  let listElements = document.querySelectorAll("#trasyList li");
  listElements.forEach((element) => {
    element.addEventListener("click", () => {
      //Styles
      listElements.forEach((el) => (el.style.backgroundColor = "transparent"));
      element.style.backgroundColor = "blue";

      //Set Edit Button to gray
      setInactiveEdit();

      //Reset Odjazdy List
      resetOdjazdy();

      //Load Edit Form
      document.getElementById("updateTrasaNazwa").value = element.dataset.nazwa;
      document.getElementById("updateTrasaOpis").value = element.dataset.opis;

      //Load Kursy
      let trasaId = element.dataset.id_trasa;
      currentTrasa = trasaId;
      canEditTrasa();
      loadKursy(trasaId);
    });
  });

  //Delete Trasa Listener
  let deleteBtns = document.querySelectorAll("#trasyList .deleteTrasa");
  for(let btn of deleteBtns)
  {
    btn.addEventListener('click', () =>{
      let trasaId = btn.parentElement.dataset.id_trasa;
      deleteTrasa(trasaId);
    });
  }
}

document.getElementById("addTrasaNazwa").addEventListener('change', canEditTrasa);
function canEditTrasa()
{
  let addNazwaIn = document.getElementById("addTrasaNazwa").value;
  let addBtn = document.getElementById("addTrasa");
  let updateBtn = document.getElementById("updateTrasa")

  if(currentTrasa == null)
  {
    updateBtn.style.backgroundColor = "gray";
  }else
  {
    updateBtn.style.backgroundColor = "green";
  }

  if(addNazwaIn == "")
  {
    addBtn.style.backgroundColor = "gray";
  }else
  {
    addBtn.style.backgroundColor = "green";
  }
}

document.getElementById("addTrasa").addEventListener('click', addTrasa);
async function addTrasa() 
{
  let addNazwaIn = document.getElementById("addTrasaNazwa").value;
  let addOpisIn = document.getElementById("addTrasaOpis").value;
  if(addNazwaIn != "")
  {
    const trasaModel = 
    {
      nazwaLinii: addNazwaIn,
      opis: addOpisIn
    };
    await api.addTrasa(trasaModel);
    window.location.reload()
  }else
    alert("Podano bledne dane");
}
document.getElementById("updateTrasa").addEventListener('click', updateTrasa);
async function updateTrasa() {
  let updateNazwaIn = document.getElementById("updateTrasaNazwa").value;
  let updateOpisIn = document.getElementById("updateTrasaOpis").value;
  if(updateNazwaIn != "")
  {
    const trasaModel = 
    {
      nazwaLinii: updateNazwaIn,
      opis: updateOpisIn
    }
    await api.updateTrasa(trasaModel, currentTrasa);
    window.location.reload()
  }else
    alert("Podano bledne dane");
}


async function deleteTrasa(trasaId) 
{
  if(confirm("Czy napewno chcesz usunac trase?"))
  {
      await api.deleteTrasa(trasaId);
      currentTrasa = null;
      currentKurs = null;
      window.location.reload();
  }
}

//KURSY
async function loadKursy(trasaId) {
  //No kurs selected
  currentKurs = null;
  currentTrasa = trasaId;
  canAddKurs();

  let kursyList = document.getElementById("kursyList");
  let kursyJson = await api.getKursyAll(trasaId);

  kursyList.innerHTML = ``;
  kursyJson.forEach((element) => {
    kursyList.innerHTML += `
                    <li data-id_kurs="${element.id}">
                        <p>Kurs ${element.id}</p>
                        <button class="editKurs">✎</button>
                        <button class="deleteKurs">✖</button>
                    </li>
                `;
  });

  //Load Odjazdy Listener
  let listElements = document.querySelectorAll("#kursyList li");
  listElements.forEach((element) => {
    element.addEventListener("click", () => {
      //Styles
      listElements.forEach((el) => (el.style.backgroundColor = "transparent"));
      element.style.backgroundColor = "blue";

      //Setting Edit button to active
      setActiveEdit();

      //Load Odjazdy List
      let kursId = element.dataset.id_kurs;
      loadOdjazdy(kursId);
    });
  });
  //Delete Kursy Listener
  let delBtns = document.querySelectorAll("#kursyList .deleteKurs");
  for(let btn of delBtns)
  {
    btn.addEventListener('click', () =>
    {
      let kursId = btn.parentElement.dataset.id_kurs;
      deleteKurs(kursId);
    })
  }

  //Edit Kursy Listener
  let editbtns = document.querySelectorAll("#kursyList .editKurs");
  for(let btn of editbtns)
  {
    btn.addEventListener('click', () => {
      let kursId = btn.parentElement.dataset.id_kurs;
      updateKurs(kursId);
    })
  }
}


document.getElementById("addKurs").addEventListener('click', addKurs)
function canAddKurs()
{
  let addBtn = document.getElementById("addKurs");
  if(currentTrasa == null)
  {
    addBtn.style.backgroundColor = "gray";
  }else
  {
    addBtn.style.backgroundColor = "green";
  }
}


async function addKurs() {
    if(currentTrasa == null)
    {
      return alert("Nie wybrano trasy");;
    }
    let trasaId = currentTrasa;
    await api.addKurs(trasaId);
    await loadKursy(trasaId);
    resetOdjazdy()
} 

async function updateKurs(kursId) {
      let newTrasaId = prompt("Podaj Id trasy");

      if(newTrasaId != "")
      {
        api.updateKurs(kursId, newTrasaId);
        window.location.reload();
      }else
      {
        alert("Podano Bledne Dane")
      }
}

async function deleteKurs(kursId) {
  if(confirm("Czy na pewno chcesz usunac kurs nr." + kursId))
  {
    await api.deleteKurs(kursId);
    await loadKursy(currentTrasa);
    kursId = null;
    resetOdjazdy()
  }
}


async function resetOdjazdy()
{
  document.getElementById("przystankiList").innerHTML = "";
  mapOperations.clear();
}


//PRZYSTANKI
async function loadOdjazdy(kursId) {
  
  currentKurs = kursId
  mapOperations.clear()

  let przystankiList = document.getElementById("przystankiList");
  let przystankiJson = await api.getOdjazdyByKursId(kursId);

  przystankiList.innerHTML = ``;
  for (let element of przystankiJson) {
    let przystanekModel = await api.getPrzystanekById(element.przystanekId);

    addMarkerFromKurs(przystanekModel);

    przystankiList.innerHTML += `
                    <li data-lt="${przystanekModel.latitude}"
                        data-lg="${przystanekModel.longitude}"
                        data-przystanek_id="${element.przystanekId}"
                        data-kurs_id="${element.kursId}">
                        <button class="zoomBtn">${przystanekModel.nazwa} ${przystanekModel.opis}</button>
                        <p>${element.godzina.slice(0,5)}</p>
                        <button class="deletePrzystanek">✖</button>
                    </li>
                `;
  }

  //Zoom
  let listElements = document.querySelectorAll("#przystankiList li .zoomBtn");
  listElements.forEach((element) => {
    element.addEventListener("click", () => {
      zoomIntoPrzystanek(element.parentElement.dataset.lt, element.parentElement.dataset.lg);
    });
  });

  //Listeners
  let listBtns = document.querySelectorAll("#przystankiList li .deletePrzystanek");
  for(let element of listBtns)
  {
    element.addEventListener("click", async () => {
      let przystanekId = element.parentElement.dataset.przystanek_id;
      let kursId = element.parentElement.dataset.kurs_id;

      let confirmation = confirm(`Czy na pewno chcesz usunac ten przystanek?`);
      if(confirmation)
      {
        await api.deleteOdjazdById(kursId, przystanekId);
        loadOdjazdy(currentKurs);
      }
    });
  }
}
//Edit Przystanki
let editPrzystankiBtn = document.getElementById("editPrzystanki");
editPrzystankiBtn.addEventListener('click', () =>
{
  editMode = !editMode;
  editPrzystanki();
});
async function setActiveEdit()
{
  editMode = false;
  editPrzystankiBtn.innerHTML = `<h2>Edytuj</h2>`
  editPrzystankiBtn.style.backgroundColor = "green";
}
async function setInactiveEdit()
{
  editMode = false;
  editPrzystankiBtn.innerHTML = `<h2>Edytuj</h2>`
  editPrzystankiBtn.style.backgroundColor = "gray";
}

function editPrzystanki()
{

  if(currentTrasa != null && currentKurs != null)
  {
    let editPrzystankiBtn = document.getElementById("editPrzystanki");
    if(editMode)
    {
      editPrzystankiBtn.innerHTML = `<h2>Skoncz Edycje</h2>`
      editPrzystankiBtn.style.backgroundColor = "red";
      mapOperations.clear();
      ShowPrzystankiAll();
    }else{
      editPrzystankiBtn.innerHTML = `<h2>Edytuj</h2>`
      editPrzystankiBtn.style.backgroundColor = "green";
      mapOperations.clear();
      loadOdjazdy(currentKurs);
    }
  }
}

loadTrasy();

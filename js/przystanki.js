import { api } from "./api.js";
import { mapOperations } from "./map.js";

async function ShowPrzystankiAll() {
  mapOperations.clear();

  var przystankiJson = await api.getPrzystankiAll();

  przystankiJson.forEach((element) => {
    let marker = mapOperations.addMarker(element.latitude, element.longitude, 
      `
      <div class="deleteMarkerContainer">
        <p>${element.nazwa} ${element.opis}</p>
        <button class="deleteMarker" data-id="${element.id}">Usun</button>
      </div>
      `
    );
    //Adding odjazd to current kurs 
    marker.on("popupopen", async (e) => {
      let btn = e.popup._contentNode.querySelector(".deleteMarker");
      btn.addEventListener("click", async () => {
        await deletePrzystanek(element.id);
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

let clickedCoordinates;

let currentPrzystanekId = null;
document.addEventListener("DOMContentLoaded", () => { mapOperations.init("map", [51.76, 18.1], 13); });
document.addEventListener("DOMContentLoaded", ShowPrzystankiAll);
document.addEventListener("mapClickedEvent", (e) =>
  {
    clickedCoordinates = e.detail;
    document.getElementById("szerokoscIn").value = clickedCoordinates.lt;
    document.getElementById("dlugoscIn").value = clickedCoordinates.lg;
    canUpdate();
  }
)
canUpdate();

async function loadPrzystanki() {
    let przystanki = await api.getPrzystankiAll();

    let przystankiList = document.getElementById("przystankiList");
    przystankiList.innerHTML = "";

    for(let przystanek of przystanki)
    {
        przystankiList.innerHTML += 
        `
            <li data-przystanekid="${przystanek.id}"
                data-lt="${przystanek.latitude}"
                data-lg="${przystanek.longitude}"
                data-nazwa="${przystanek.nazwa}"
                data-opis="${przystanek.opis}">
                <p>${przystanek.nazwa} ${przystanek.opis}</p>
                <button>X</button>
            </li>
        `
    }

    //Zoom
    let listElements = document.querySelectorAll("#przystankiList li");
    listElements.forEach((element) => {
        element.addEventListener("click", () => {
          listElements.forEach((el) => (el.style.backgroundColor = "transparent"));
          element.style.backgroundColor = "blue";

          zoomIntoPrzystanek(element.dataset.lt, element.dataset.lg);

          currentPrzystanekId = element.dataset.przystanekid;
          document.getElementById("nazwaIn").value = element.dataset.nazwa;
          document.getElementById("opisIn").value = element.dataset.opis;
          document.getElementById("szerokoscIn").value = element.dataset.lt;
          document.getElementById("dlugoscIn").value = element.dataset.lg;
          canUpdate();
        });
    });

    let delBtns = document.querySelectorAll("#przystankiList button");
    for(let btn of delBtns)
    {
      btn.addEventListener('click', () => deletePrzystanek(btn.parentElement.dataset.przystanekid));
    }
}
await loadPrzystanki();


document.getElementById("nazwaIn").addEventListener('change', canUpdate);
document.getElementById("szerokoscIn").addEventListener('change', canUpdate);
document.getElementById("dlugoscIn").addEventListener('change', canUpdate);
function canUpdate() {
  let nazwa = document.getElementById("nazwaIn").value;
  let szerokosc = document.getElementById("szerokoscIn").value;
  let dlugosc = document.getElementById("dlugoscIn").value;
  let updateBtn = document.getElementById("updatePrzystanek");
  let addBtn = document.getElementById("addPrzystanek");


  if(currentPrzystanekId == null || nazwa == "" || szerokosc == "" || dlugosc == "")
  {
    updateBtn.style.backgroundColor = "grey";
  }else
  {
    updateBtn.style.backgroundColor = "green";
  }
  if(nazwa == "" || szerokosc == "" || dlugosc == "")
  {
    addBtn.style.backgroundColor = "grey";
  }else
  {
    addBtn.style.backgroundColor = "green";
  }
}



document.getElementById("updatePrzystanek").addEventListener('click', updatePrzystanek);
async function updatePrzystanek()
{
    let przystanekModel = loadEditForm();
    if(przystanekModel == null)
    {
      return alert("Nie podano wszystkich danych");
    }
    if(currentPrzystanekId == null)
    {
      return alert("Nie wybrano przystanku")
    }

    if(confirm("Zapisac Zmiany?"))
    {
      await api.updatePrzystanek(currentPrzystanekId, przystanekModel);
      currentPrzystanekId = null;
      window.location.reload();
    }
}

document.getElementById("addPrzystanek").addEventListener('click', addPrzystanek);
async function addPrzystanek() 
{
    let przystanekModel = loadEditForm();
    if(przystanekModel == null)
    {
      return alert("Nie podano wszystkich danych");
    }

    await api.addPrzystanek(przystanekModel);
    currentPrzystanekId = null;
    window.location.reload();
}

async function deletePrzystanek(przystanekId) {
  if(confirm("Czy na pewno chcesz usunac przystanek"))
  {
    await api.deletePrzystanek(przystanekId);
    window.location.reload();
  }
}


function loadEditForm()
{
  let _nazwa = document.getElementById("nazwaIn").value;
  let _opis = document.getElementById("opisIn").value;
  let _szerokosc = document.getElementById("szerokoscIn").value;
  let _dlugosc = document.getElementById("dlugoscIn").value;

  if(_nazwa == "" || _szerokosc == "" || _dlugosc == "")
  {
    return null;
  }

  let przystanekModel = {
    nazwa: _nazwa,
    opis: _opis,
    latitude: _szerokosc,
    longitude: _dlugosc
  }

  return przystanekModel;
}

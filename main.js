const departmentSelect = document.getElementById("departments")
const form = document.getElementById("form")
const keywordInput = document.getElementById("keyword")
const locationInput = document.getElementById("location")
const gallery = document.getElementById("resultGallery")

const baseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/';
fillSelect()

function fillSelect() {
    const deps = fetch(`${baseURL}departments`).then((res) => res.json()).then((data) => {

        const allDepartments = document.createElement('option')
        allDepartments.setAttribute('value', '0')
        allDepartments.textContent = 'TODOS LOS DEPARTAMENTOS'
        departmentSelect.appendChild(allDepartments)
        
        data.departments.forEach((d) => {
            const myOption = document.createElement('option')
            myOption.setAttribute("value", d.departmentId)
            myOption.textContent = (d.displayName).toUpperCase()

            departmentSelect.appendChild(myOption)
        });
    })
}

form.addEventListener('submit', (event) => {
    event.preventDefault()

    clearGallery()

    const keywordSearch = keywordInput.value
    const locationSearch = locationInput.value
    const departmentSearch = departmentSelect.value

    search = {}
    if (keywordSearch) {
        search.keyword = keywordSearch
    } else {
        search.keyword = "*"
    }
    if (locationSearch) {
        search.location = locationSearch
    } else {
        search.location = null
    }
    if (departmentSearch != 0) {
        search.departmentId = departmentSearch
    } else {
        search.departmentId = null
    }
    
    createSearchQuery(search)
})


function createSearchQuery(search) {
    searchQuery = []

    if (search.keyword) {
        searchQuery.push("q=" + search.keyword)
    }
    if (search.location) {
        searchQuery.push("geoLocation=" + search.location)
    }
    if (search.departmentId) {
        searchQuery.push("departmentId=" + search.departmentId)
    }

    searchURL = baseURL + "search?" + searchQuery.join("&") 

    console.log(searchURL)
    getIDs(searchURL)
}

function getIDs(searchURL) {
    fetch(searchURL).then((res) => res.json()).then((data) => {
        const IDs = data.objectIDs.slice(0, 20)

        IDs.forEach((id) => {
            fetch(baseURL + "objects/" + id).then((res) => res.json()).then((artworks) => {
                createCards(artworks)
            })
        })
    })
}

function createCards(artworks) {
    const artworkCard = document.createElement('div')
    artworkCard.setAttribute('class', 'card')

    const title = document.createElement('h3')
    title.textContent = artworks.title

    const image = document.createElement('img')
    if (artworks.primaryImageSmall) {
        image.setAttribute('src', artworks.primaryImageSmall)
    } else {
        image.setAttribute('src', "images/no-image.jpg")
    }
    image.setAttribute('class', 'cardImage')

    artworkCard.appendChild(title)
    artworkCard.appendChild(image)

    gallery.appendChild(artworkCard)
}

function clearGallery() {
    let child = gallery.lastElementChild
    while (child) {
        gallery.removeChild(child)
        child = gallery.lastElementChild
    }
}
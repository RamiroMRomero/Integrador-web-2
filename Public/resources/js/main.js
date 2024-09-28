const departmentSelect = document.getElementById("departments")
const form = document.getElementById("form")
const keywordInput = document.getElementById("keyword")
const locationInput = document.getElementById("location")
const gallery = document.getElementById("resultGallery")
const footer = document.getElementById("footer")
const modal = document.getElementById("modal")

///////////////////

const baseURL = 'https://collectionapi.metmuseum.org/public/collection/v1/';
let currentPage = 1
let totalPages = 0
let allIDs = []

//////////////////

fillSelect()

function fillSelect() {
    fetch(`${baseURL}departments`).then((res) => res.json()).then((data) => {

        const allDepartments = document.createElement('option')
        allDepartments.setAttribute('value', '0')
        allDepartments.textContent = 'TODOS LOS DEPARTAMENTOS'
        departmentSelect.appendChild(allDepartments)
        
        data.departments.forEach((d) => {
            // translation

            fetch('./translate/' + d.displayName).then((res) => res.json()).then((data) => {
                const optionSelect = document.createElement('option')
                optionSelect.setAttribute("value", d.departmentId)
                optionSelect.textContent = (data.textoTraducido).toUpperCase()
    
                departmentSelect.appendChild(optionSelect)
            })
        });
    })
}

form.addEventListener('submit', (event) => {
    event.preventDefault()
    currentPage = 1
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

    searchQuery.push("q=" + search.keyword)
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
        totalPages = Math.ceil(data.total / 20)
        allIDs = data.objectIDs
        showCards(allIDs)
    }).catch(renderEmpty)
}

function renderEmpty() {
    const emptyResult = document.createElement('h2')
    emptyResult.textContent = "No se encontraron resultados con su busqueda"
    emptyResult.setAttribute('class', 'emptyResults')

    gallery.appendChild(emptyResult)
}

function renderCards(artworks) {
    const artworkCard = document.createElement('div')
    artworkCard.setAttribute('class', 'card')

    const title = document.createElement('h3')
    title.textContent = artworks.title
    artworkCard.appendChild(title)

    const imageContainer = document.createElement('div')
    imageContainer.setAttribute('class', 'imageContainer')

    const image = document.createElement('img')
    if (artworks.primaryImageSmall) {
        image.setAttribute('src', artworks.primaryImageSmall)
    } else {
        image.setAttribute('src', "/resources/images/no-image.jpg")
    }
    image.setAttribute('class', 'cardImage')

    const date = document.createElement('div')

    if(artworks.objectDate) {
        date.textContent = "Fecha de creacion: " + artworks.objectDate
    } else {
        date.textContent = "Fecha de creacion desconocida"
    }
    
    date.setAttribute('class', 'dateOverlay')
    date.style.opacity = "0%"

    imageContainer.appendChild(image)
    imageContainer.appendChild(date)

    imageContainer.onmouseover = () => {
        date.style.opacity = "100%"
    }
    imageContainer.onmouseout = () => {
        date.style.opacity = "0%"
    }

    artworkCard.appendChild(imageContainer)
    
    if(artworks.culture) {
        const culture = document.createElement('p')
        culture.textContent = "Cultura: " + artworks.culture
        artworkCard.appendChild(culture)
    }

    if(artworks.dynasty) {
        const dynasty = document.createElement('p')
        dynasty.textContent = "Dinastia: " + artworks.dynasty
        artworkCard.appendChild(dynasty)
    }

    const cardButton = document.createElement('button')
    cardButton.id = artworks.objectID
    cardButton.textContent = "ver imagenes adicionales"
    cardButton.setAttribute('onclick', 'createModal(this.id)')

    artworkCard.appendChild(cardButton)

    gallery.appendChild(artworkCard)
}

function createModal(id) {
    clearModal()
    fetch(baseURL + "objects/" + id).then((res) => res.json()).then((data) => {
        additionalImages = data.additionalImages
        if(additionalImages) {
            additionalImages.forEach(i => {
                const image = document.createElement('img')
                image.setAttribute('src', i)
                modal.appendChild(image)
            })
            modal.style.display = 'block'

            const buttonDiv = document.createElement('div')
            const exit = document.createElement('button')
            exit.setAttribute('onclick', 'clearModal()')
            exit.textContent = 'X'

            buttonDiv.setAttribute('class', 'buttonDiv')
            buttonDiv.appendChild(exit)

            modal.appendChild(buttonDiv)
        } else {

        }
    })
}

function clearModal() {
    let child1 = modal.lastElementChild
    while (child1) {
        modal.removeChild(child1)
        child1 = modal.lastElementChild
    }
    modal.style.display = 'none'
}

function clearGallery() {
    let child1 = gallery.lastElementChild
    while (child1) {
        gallery.removeChild(child1)
        child1 = gallery.lastElementChild
    }
    let child2 = footer.lastElementChild
    while (child2) {
        footer.removeChild(child2)
        child2 = footer.lastElementChild
    }
}

function renderPaginationButtons() {
    if (totalPages == 1) {return}
    if (totalPages > 15) {totalPages = 15}

    for(let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button')
        pageButton.textContent = i
        pageButton.setAttribute('onclick', 'changePage(this)')

        footer.appendChild(pageButton)
    }
}

function changePage(button) {
    currentPage = button.textContent
    clearGallery()
    showCards(allIDs)

}

function showCards(allIDs) {
    renderPaginationButtons()
    const IDs = allIDs.slice((currentPage-1)*20, currentPage*20)
    IDs.forEach((id) => {
        fetch(baseURL + "objects/" + id).then((res) => res.json()).then((artworks) => {
            renderCards(artworks)
        })
    })
}

encodeURIComponent
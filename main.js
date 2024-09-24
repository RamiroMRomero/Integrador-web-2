const departmentSelect = document.getElementById("departments")

const urlBase = 'https://collectionapi.metmuseum.org/public/collection/v1/';
fillSelect()

function fillSelect() {
    const deps = fetch(`${urlBase}departments`).then((res) => res.json()).then((data) => {

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
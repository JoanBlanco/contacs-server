// VARIABLES DEL DOM
const form = document.querySelector('#form');
const nameInput = document.querySelector('#name-input');
const numberInput = document.querySelector('#number-input');
const numberSelect = document.querySelector('#number-select');
const listContainer = document.querySelector('.list-container');
// REGEX
const NUMBER_REGEX = /^(0412|0212|0416|0426|0414|0424)(\d{7})$/;
 // FUNCTIONS
// GET CONTACT WITH FETCH
const getContacts = async () => {
    const response = await fetch('http://localhost:3004/contacts', {method: 'GET'});
    const data = await response.json();
    return data;
}
// VALIDATE FORM
const validateForm = async e => {
    e.preventDefault();
    const numberTel = numberSelect.value + numberInput.value;
    const getData = await getContacts();
    const contact = getData.find(contact => contact.number === numberTel);
    if (!nameInput.value || !numberInput.value || !numberSelect.value) {
        notificationCreate('Debes llenar los campos', 'error');
        return;
    }
    if (nameInput.value.trim().length > 12) {
        notificationCreate('Debe ser un nombre más corto', 'error');
        return;
    }
    if (contact) {
        notificationCreate('Este número ya existe!', 'error');
        return;
    }
    if (NUMBER_REGEX.test(numberTel)) {
        notificationCreate('Contacto agregado!', 'correct');
        await fetch('http://localhost:3004/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: nameInput.value, number: numberTel})
        });
        createContactList();
        resetForm();
        return;
    } else {
        notificationCreate('Número inválido!', 'error');
        return;
    }
}
// CREATE LIST CONTACTS
const createContactList = async () => {
    cleanHTML();
    const contacts = await getContacts();
    contacts.forEach(contact => {
        const {username, number, id} = contact;
        const li = document.createElement('LI');
        li.classList.add('list');
        li.dataset.id = id;
        li.innerHTML = 
        `
            <div class="circle">
                <span>${username.charAt(0).toUpperCase()}</span>
            </div>
            <input class="list-name" type="text" readonly value="${username}">
            <input class="list-number" type="tel" readonly value="${number}">
            <div class="button-container">
                <button data-id="${id}" id="edit"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
                    <path d="M13.5 6.5l4 4"></path>
                </svg></button>
                <button data-id="${id}" id="delete"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 7l16 0"></path>
                    <path d="M10 11l0 6"></path>
                    <path d="M14 11l0 6"></path>
                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path>
                </svg></button>
            </div>
        `;
        listContainer.appendChild(li);
        li.addEventListener('click', async (e) => {
            const target = e.target;
            const btnEdit = target.closest('#edit');
            if (target.closest('#edit')) {
                const id = target.closest('#edit').dataset.id; 
                (!target.closest('#edit').classList.contains('edit')) ? editContact(btnEdit) : closeEdit(id, btnEdit)
            }
            if (target.closest('#delete')) {
               const id = target.closest('#delete').dataset.id
               await fetch(`http://localhost:3004/contacts/${id}`, { method: 'DELETE' });
               await createContactList();
            }
        });
    });
}
// EDIT CONTACT
const editContact = (btnEdit) => {
    btnEdit.classList.toggle('edit');
    btnEdit.parentElement.parentElement.querySelector('.list-name').removeAttribute('readonly');
    btnEdit.parentElement.parentElement.querySelector('.list-number').removeAttribute('readonly');
    btnEdit.parentElement.parentElement.querySelector('.list-name').value = "";
    btnEdit.parentElement.parentElement.querySelector('.list-name').focus();
    btnEdit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-device-floppy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2"></path>
    <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
    <path d="M14 4l0 4l-6 0l0 -4"></path>
    </svg>`;
}
// CLOSE EDIT MODE
const closeEdit = async (id, btnEdit) => {
    const getData = await getContacts();
    const contact = getData.find(contact => contact.number === btnEdit.parentElement.parentElement.querySelector('.list-number').value);
    btnEdit.classList.toggle('edit');
    btnEdit.parentElement.parentElement.querySelector('.list-name').setAttribute('readonly', true);
    btnEdit.parentElement.parentElement.querySelector('.list-number').setAttribute('readonly', true);
    btnEdit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4"></path>
    <path d="M13.5 6.5l4 4"></path>
    </svg>`;
    // CONDICIONALES
    if (btnEdit.parentElement.parentElement.querySelector('.list-name').value.length > 12) {
        alert('El nombre es muy largo!');
        editContact(btnEdit);
        return;
    }
    if (btnEdit.parentElement.parentElement.querySelector('.list-name').value === "" || !NUMBER_REGEX.test(btnEdit.parentElement.parentElement.querySelector('.list-number').value) || btnEdit.parentElement.parentElement.querySelector('.list-number').value === "") {
        alert('Debes agregar un nombre o número válido');
        editContact(btnEdit);
        return;
    }
    if (contact && contact.id !== Number(id)) {
        alert('Este número ya existe!');
        editContact(btnEdit);
        return;
    } else {
        alert('Editado Correctamente');
        await fetch(`http://localhost:3004/contacts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: btnEdit.parentElement.parentElement.querySelector('.list-name').value, number: btnEdit.parentElement.parentElement.querySelector('.list-number').value})
        });
        createContactList();
        return;
    }
}
// CLEAN LIST CONTAINER
const cleanHTML = () => {
    while (listContainer.firstElementChild) {
        listContainer.removeChild(listContainer.firstElementChild);
    }
}
// CREATE NOTIFICATION 
const notificationCreate = (message, type) => {
    const div = document.createElement('DIV');
    div.textContent = message;
    div.classList.add('notification', `${type}`)
    const notifications = document.querySelectorAll('.notification');
    if (notifications.length === 0) {
        form.insertAdjacentElement('afterbegin', div);
        setTimeout(() => div.remove(), 3000);
    }
}
// RESET FORM
const resetForm = () => {
    form.reset();
}
// CHARGE EVENT LISTENERS
const eventListeners = () => {
    document.addEventListener('DOMContentLoaded', () => {
        resetForm();
        createContactList();
    })
    form.addEventListener('submit', validateForm);
}
eventListeners();
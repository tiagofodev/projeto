const Developers = {
    load: function (page = 1) {
        fetch(`http://localhost:8085/desenvolvedores?limit=10&offset=${(page - 1) * 10}`, {
            method: 'GET',
            cache: 'default'
        })
        .then(response => {
            console.log('Resposta recebida:', response);
            if (response.status === 404) {
                console.warn('Recurso não encontrado:', response.status, response.statusText);
                return { data: null, status: response.status };
            }

            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText + ' - ' + text);
                });
            }

            return response.json().then(data => ({ data, status: response.status }));
        })
        .then(result => {
            if (result.status === 404) {
                console.log('Dados não encontrados');
                Swal.fire({
                    title: 'Não Encontrado!',
                    text: 'O recurso solicitado não foi encontrado.',
                    icon: 'info',
                    confirmButtonText: 'Ok'
                });
            } else {
                this.populateTable(result.data.data);
                this.updatePagination(result.data.meta);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error.message);
            Swal.fire({
                title: 'Erro!',
                text: `Ocorreu um erro ao fazer a requisição: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
    },

    populateTable: function (data) {
        const tableBody = document.getElementById('developerTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (data && data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');

                    const idCell = document.createElement('th');
                    idCell.scope = 'row';
                    idCell.textContent = item.id;

                    const nameCell = document.createElement('td');
                    nameCell.textContent = item.nome;

                    const genderCell = document.createElement('td');
                    genderCell.textContent = item.sexo;

                    const birthDateCell = document.createElement('td');
                    birthDateCell.textContent = item.data_nascimento;

                    const hobbyCell = document.createElement('td');
                    hobbyCell.textContent = item.hobby;

                    const levelCell = document.createElement('td');
                    levelCell.textContent = item.nivel.nivel || 'N/A';

                    const actionsCell = document.createElement('td');
                    actionsCell.innerHTML = `
                        <button type="button" class="btn btn-info btn-sm" onclick="Developers.edit(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="Developers.delete(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;

                    row.appendChild(idCell);
                    row.appendChild(nameCell);
                    row.appendChild(genderCell);
                    row.appendChild(birthDateCell);
                    row.appendChild(hobbyCell);
                    row.appendChild(levelCell);
                    row.appendChild(actionsCell);
                    tableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 7;
                cell.textContent = 'Nenhum desenvolvedor encontrado.';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        } else {
            console.error('Elemento com ID "developerTableBody" não encontrado.');
        }
    },

    updatePagination: function (meta) {
        this.totalPages = meta.last_page;
        this.currentPage = meta.current_page;

        const paginationContainer = document.querySelector('.devpage');
        paginationContainer.innerHTML = ''; // Limpa a navegação existente

        // Botão "Anterior"
        const prevButton = document.createElement('li');
        prevButton.id = 'prevPage';
        prevButton.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<a class="page-link" href="#" tabindex="-1">Anterior</a>';
        paginationContainer.appendChild(prevButton);

        // Botões de páginas
        for (let i = 1; i <= this.totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.id = `page${i}`;
            pageItem.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            paginationContainer.appendChild(pageItem);
        }

        // Botão "Próximo"
        const nextButton = document.createElement('li');
        nextButton.id = 'nextPage';
        nextButton.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<a class="page-link" href="#">Próximo</a>';
        paginationContainer.appendChild(nextButton);

        this.addPaginationEventListeners();
    },

    addPaginationEventListeners: function () {
        document.querySelectorAll('.page-item').forEach(item => {
            item.addEventListener('click', (event) => {
                const pageLink = event.target.closest('.page-link');
                if (pageLink) {
                    const page = parseInt(pageLink.textContent);
                    if (!isNaN(page)) {
                        this.load(page);
                    } else if (event.target.closest('#prevPage')) {
                        if (this.currentPage > 1) {
                            this.load(this.currentPage - 1);
                        }
                    } else if (event.target.closest('#nextPage')) {
                        if (this.currentPage < this.totalPages) {
                            this.load(this.currentPage + 1);
                        }
                    }
                }
            });
        });
    },

    save: function (id = null) {
        const isEdit = id !== null;
    
        fetch('http://localhost:8085/niveis', {
            method: 'GET',
            cache: 'default'
        })
        .then(response => response.json())
        .then(niveisData => {
            // Inicializa a variável nivelSelecionado como uma string vazia
            let nivelSelecionado = '';
    
            // Se for uma edição, obtém os dados do desenvolvedor
            if (isEdit) {
                return fetch(`http://localhost:8085/desenvolvedores/${id}`, {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(data => {
                    const developer = data.data[0]; // Obtém o primeiro desenvolvedor do array
                    nivelSelecionado = developer.nivel_id; // Define o nível selecionado
    
                    // Cria as opções do select com a opção selecionada
                    const niveisOptions = `
                        <option value="" disabled ${!nivelSelecionado ? 'selected' : ''}>Selecione um nível</option>
                        ${niveisData.data
                            .map(nivel => {
                                return `<option value="${nivel.id}" ${nivel.id == nivelSelecionado ? 'selected' : ''}>${nivel.nivel}</option>`;
                            })
                            .join('')}
                    `;
    
                    // Exibe o Swal com as opções
                    return Swal.fire({
                        title: 'Editar Desenvolvedor',
                        html: `
                            <input id="nome" class="swal2-input" placeholder="Nome" value="${developer.nome}">
                            <input id="sexo" class="swal2-input" placeholder="Sexo (M/F)" value="${developer.sexo}">
                            <input id="data_nascimento" type="date" class="swal2-input" placeholder="Data de Nascimento" value="${developer.data_nascimento}">
                            <input id="hobby" class="swal2-input" placeholder="Hobby" value="${developer.hobby}">
                            <select id="nivel_id" class="swal2-input">${niveisOptions}</select>
                        `,
                        focusConfirm: false,
                        preConfirm: () => {
                            const nome = Swal.getPopup().querySelector('#nome').value;
                            const sexo = Swal.getPopup().querySelector('#sexo').value;
                            const data_nascimento = Swal.getPopup().querySelector('#data_nascimento').value;
                            const hobby = Swal.getPopup().querySelector('#hobby').value;
                            const nivel_id = Swal.getPopup().querySelector('#nivel_id').value;
    
                            if (!nome || !sexo || !data_nascimento || !hobby || !nivel_id) {
                                Swal.showValidationMessage('Por favor, preencha todos os campos');
                                return false;
                            }
                            if (sexo.length !== 1) {
                                Swal.showValidationMessage('O campo Sexo deve conter apenas um caractere');
                                return false;
                            }
                            if (!validateAge(data_nascimento, 16)) {
                                Swal.showValidationMessage('O desenvolvedor deve ter pelo menos 16 anos.');
                                return false;
                            }
                            return { nome, sexo, data_nascimento, hobby, nivel_id };
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const updatedData = result.value;
                            fetch(`http://localhost:8085/desenvolvedores/${id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updatedData)
                            })
                            .then(response => {
                                if (!response.ok) {
                                    return response.text().then(text => {
                                        throw new Error('Erro na resposta da rede: ' + response.status + ' ' + response.statusText + ' - ' + text);
                                    });
                                }
                                return response.json();
                            })
                            .then(() => {
                                Swal.fire({
                                    title: 'Atualizado!',
                                    text: 'O desenvolvedor foi atualizado.',
                                    icon: 'success',
                                    confirmButtonText: 'Ok'
                                });
                                this.load(); // Recarrega os dados da tabela após edição
                            })
                            .catch(error => {
                                console.error('Erro ao atualizar o desenvolvedor:', error.message);
                                Swal.fire({
                                    title: 'Erro!',
                                    text: `Ocorreu um erro ao atualizar o desenvolvedor: ${error.message}`,
                                    icon: 'error',
                                    confirmButtonText: 'Ok'
                                });
                            });
                        }
                    });
                });
            } else {
                // Se for uma adição, cria as opções do select
                const niveisOptions = `
                    <option value="" disabled selected>Selecione um nível</option>
                    ${niveisData.data
                        .map(nivel => `<option value="${nivel.id}">${nivel.nivel}</option>`)
                        .join('')}
                `;
    
                return Swal.fire({
                    title: 'Adicionar Desenvolvedor',
                    html: `
                        <input id="nome" class="swal2-input" placeholder="Nome">
                        <input id="sexo" class="swal2-input" placeholder="Sexo (M/F)">
                        <input id="data_nascimento" type="date" class="swal2-input" placeholder="Data de Nascimento">
                        <input id="hobby" class="swal2-input" placeholder="Hobby">
                        <select id="nivel_id" class="swal2-input">${niveisOptions}</select>
                    `,
                    focusConfirm: false,
                    preConfirm: () => {
                        const nome = Swal.getPopup().querySelector('#nome').value;
                        const sexo = Swal.getPopup().querySelector('#sexo').value;
                        const data_nascimento = Swal.getPopup().querySelector('#data_nascimento').value;
                        const hobby = Swal.getPopup().querySelector('#hobby').value;
                        const nivel_id = Swal.getPopup().querySelector('#nivel_id').value;
    
                        if (!nome || !sexo || !data_nascimento || !hobby || !nivel_id) {
                            Swal.showValidationMessage('Por favor, preencha todos os campos');
                            return false;
                        }
                        if (sexo.length !== 1) {
                            Swal.showValidationMessage('O campo Sexo deve conter apenas um caractere');
                            return false;
                        }
                        if (!validateAge(data_nascimento, 16)) {
                            Swal.showValidationMessage('O desenvolvedor deve ter pelo menos 16 anos.');
                            return false;
                        }
                        return { nome, sexo, data_nascimento, hobby, nivel_id };
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        const newData = result.value;
                        fetch('http://localhost:8085/desenvolvedores', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newData)
                        })
                        .then(response => {
                            if (!response.ok) {
                                return response.text().then(text => {
                                    throw new Error('Erro na resposta da rede: ' + response.status + ' ' + response.statusText + ' - ' + text);
                                });
                            }
                            return response.json();
                        })
                        .then(() => {
                            Swal.fire({
                                title: 'Adicionado!',
                                text: 'O desenvolvedor foi adicionado.',
                                icon: 'success',
                                confirmButtonText: 'Ok'
                            });
                            this.load(); // Recarrega os dados da tabela após adição
                        })
                        .catch((error, item) => {

                            console.error('Erro ao adicionar o desenvolvedor:', error.message);
                            console.error(error, item);
                            Swal.fire({
                                title: 'Erro!',
                                text: `Ocorreu um erro ao adicionar o desenvolvedor: ${error.message}`,
                                icon: 'error',
                                confirmButtonText: 'Ok'
                            });
                        });
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os níveis:', error.message);
            Swal.fire({
                title: 'Erro!',
                text: `Ocorreu um erro ao carregar os níveis: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
    },
    
    delete: function (id) {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Você não poderá reverter isso!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:8085/desenvolvedores/${id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error('Erro na resposta da rede: ' + response.status + ' ' + response.statusText + ' - ' + text);
                        });
                    }
                    return response.text();
                })
                .then(() => {
                    Swal.fire({
                        title: 'Excluído!',
                        text: 'O desenvolvedor foi excluído.',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });
                    this.load(); // Recarrega os dados da tabela após exclusão
                })
                .catch(error => {
                    console.error('Erro:', error.message);
                    Swal.fire({
                        title: 'Erro!',
                        text: `Ocorreu um erro ao excluir o desenvolvedor: ${error.message}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
            }
        });
    },

    edit: function (id) {
        this.save(id); // Chama a função save com o ID para editar o desenvolvedor
    }
};

window.Developers = Developers;

// Função para validar a idade mínima
function validateAge(dateOfBirth, minAge) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= minAge;
}
const Niveis = {
    currentPage: 1,
    totalPages: 1,

    load: function (page = 1) {
        fetch(`http://localhost:8085/niveis?limit=10&offset=${(page - 1) * 10}`, {
            method: 'GET',
            cache: 'default'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error('Network response was not ok: ' + response.status + ' ' + response.statusText + ' - ' + text);
                });
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.data || data.data.length === 0) {
                console.log('Dados não encontrados');
                Swal.fire({
                    title: 'Não Encontrado!',
                    text: 'O recurso solicitado não foi encontrado.',
                    icon: 'info',
                    confirmButtonText: 'Ok'
                });
            } else {
                this.populateTable(data.data);
                this.updatePagination(data.meta);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar níveis:', error.message);
            Swal.fire({
                title: 'Erro!',
                text: `Ocorreu um erro ao fazer a requisição: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
    },

    populateTable: function (data) {
        const tableBody = document.getElementById('nivelTableBody');
        if (tableBody) {
            tableBody.innerHTML = '';

            if (data && data.length > 0) {
                data.forEach(item => {
                    const row = document.createElement('tr');

                    const idCell = document.createElement('th');
                    idCell.scope = 'row';
                    idCell.textContent = item.id;

                    const nameCell = document.createElement('td');
                    nameCell.textContent = item.nivel;

                    const actionsCell = document.createElement('td');
                    actionsCell.innerHTML = `
                        <button type="button" class="btn btn-info btn-sm" onclick="Niveis.edit(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="Niveis.delete(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;

                    row.appendChild(idCell);
                    row.appendChild(nameCell);
                    row.appendChild(actionsCell);
                    tableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 3;
                cell.textContent = 'Nenhum nível encontrado.';
                row.appendChild(cell);
                tableBody.appendChild(row);
            }
        } else {
            console.error('Elemento com ID "nivelTableBody" não encontrado.');
        }
    },

    updatePagination: function (meta) {
        this.totalPages = meta.last_page;
        this.currentPage = meta.current_page;

        const paginationContainer = document.querySelector('.pagination');
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

        Swal.fire({
            title: isEdit ? 'Editar Nível' : 'Adicionar Nível',
            input: 'text',
            inputLabel: 'Nome do Nível',
            inputPlaceholder: 'Digite o nome do nível',
            icon: 'info',
            confirmButtonText: isEdit ? 'Salvar' : 'Adicionar',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            preConfirm: (nivel) => {
                if (!nivel) {
                    Swal.showValidationMessage('Por favor, digite o nome do nível');
                    return false;
                }
                return nivel;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const nivel = result.value;
                const method = isEdit ? 'PUT' : 'POST';
                const url = isEdit ? `http://localhost:8085/niveis/${id}` : 'http://localhost:8085/niveis';
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nivel: nivel })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error('Erro na resposta da rede: ' + response.status + ' ' + response.statusText + ' - ' + text);
                        });
                    }
                    return response.text();
                })
                .then(text => {
                    try {
                        const data = JSON.parse(text);
                        console.log('Nível salvo:', data);
                        Swal.fire({
                            title: 'Sucesso!',
                            text: 'Nível salvo com sucesso.',
                            icon: 'success',
                            confirmButtonText: 'Ok'
                        });
                        this.load(); // Recarrega os dados da tabela após salvar
                    } catch (e) {
                        console.error('Erro ao analisar a resposta JSON:', e);
                        Swal.fire({
                            title: 'Erro!',
                            text: 'Resposta da API não é um JSON válido.',
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                    }
                })
                .catch(error => {
                    console.error('Erro ao salvar nível:', error.message);
                    Swal.fire({
                        title: 'Erro!',
                        text: `Ocorreu um erro ao salvar o nível: ${error.message}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
            }
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
                fetch(`http://localhost:8085/niveis/${id}`, {
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
                .then(text => {
                    Swal.fire({
                        title: 'Excluído!',
                        text: 'O nível foi excluído.',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });
                    this.load(); // Recarrega os dados da tabela após exclusão
                })
                .catch(error => {
                    console.log(typeof(error));
                    console.log(error.message);
                    if(error.message && error.message.includes('desenvolvedores')){
                        Swal.fire({
                            title: 'Erro!',
                            text: `Ocorreu um erro ao excluir o nível, pois o nível está associado a algum desenvolvedor`,
                            icon: 'error',
                            confirmButtonText: 'Ok'
                        });
                        return;
                    }
                    console.error('Erro ao excluir nível:', error.message);
                    Swal.fire({
                        title: 'Erro!',
                        text: `Ocorreu um erro ao excluir o nível: ${error.message}`,
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
            }
        });
    },

    edit: function (id) {
        // Recupera o nível atual
        fetch(`http://localhost:8085/niveis/${id}`, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error('Erro na resposta da rede: ' + response.status + ' ' + response.statusText + ' - ' + text);
                });
            }
            return response.json();
        })
        .then(data => {
            this.save(id); // Chama a função save com o ID para editar o nível
        })
        .catch(error => {
            console.error('Erro ao recuperar o nível:', error.message);
            Swal.fire({
                title: 'Erro!',
                text: `Ocorreu um erro ao recuperar o nível: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        });
    }
};

window.Niveis = Niveis;
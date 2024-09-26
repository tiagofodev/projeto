# Documentação da API

## Visão Geral

Esta API fornece endpoints para gerenciar níveis e desenvolvedores.

## Endpoints

### Níveis

#### `POST /niveis`

- **Descrição**: Adicionar um novo nível.
- **Corpo da Requisição**: 
  ```json
  {
    "nivel": "Nome do Nível"
  }
  ```
- **Respostas**:
  - `201 Created`: Nível criado com sucesso.
  - `400 Bad Request`: Dados da requisição inválidos.

#### `GET /niveis`

- **Descrição**: Recuperar uma lista de níveis.
- **Parâmetros de Consulta**:
  - `limit` (opcional): Número de itens por página.
  - `offset` (opcional): Número de itens a pular.
- **Respostas**:
  - `200 OK`: Lista de níveis.
    ```json
    {
      "status": 200,
      "data": [
        {
          "id": 1,
          "nivel": "Junior C"
        },
        {
          "id": 2,
          "nivel": "Pleno"
        },
        {
          "id": 3,
          "nivel": "Senior"
        },
        {
          "id": 11,
          "nivel": "Master"
        }
      ],
      "meta": {
        "total": 10,
        "per_page": 10,
        "current_page": 1,
        "last_page": 1
      }
    }
    ```
  - `404 Not Found`: Nenhum nível encontrado.

#### `PUT /niveis/{id}`

- **Descrição**: Atualizar um nível existente.
- **Parâmetros de Caminho**:
  - `id`: ID do nível a ser atualizado.
- **Corpo da Requisição**:
  ```json
  {
    "nivel": "Nome do Nível Atualizado"
  }
  ```
- **Respostas**:
  - `200 OK`: Nível atualizado com sucesso.
  - `400 Bad Request`: Dados da requisição inválidos.
  - `404 Not Found`: Nível não encontrado.

#### `DELETE /niveis/{id}`

- **Descrição**: Excluir um nível.
- **Parâmetros de Caminho**:
  - `id`: ID do nível a ser excluído.
- **Respostas**:
  - `200 OK`: Nível excluído com sucesso.
  - `404 Not Found`: Nível não encontrado.

### Desenvolvedores

#### `POST /desenvolvedores`

- **Descrição**: Adicionar um novo desenvolvedor.
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Nome do Desenvolvedor",
    "sexo": "Sexo do Desenvolvedor (M/F)",
    "data_nascimento": "Data de Nascimento (YYYY-MM-DD)",
    "idade": "Idade do Desenvolvedor",
    "hobby": "Hobby do Desenvolvedor",
    "nivel_id": "ID do Nível"
  }
  ```
- **Respostas**:
  - `201 Created`: Desenvolvedor criado com sucesso.
  - `400 Bad Request`: Dados da requisição inválidos.

#### `GET /desenvolvedores`

- **Descrição**: Recuperar uma lista de desenvolvedores.
- **Parâmetros de Consulta**:
  - `limit` (opcional): Número de itens por página.
  - `offset` (opcional): Número de itens a pular.
- **Respostas**:
  - `200 OK`: Lista de desenvolvedores.
  - `404 Not Found`: Nenhum desenvolvedor encontrado.

#### `PUT /desenvolvedores/{id}`

- **Descrição**: Atualizar um desenvolvedor existente.
- **Parâmetros de Caminho**:
  - `id`: ID do desenvolvedor a ser atualizado.
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Nome do Desenvolvedor Atualizado",
    "sexo": "Sexo do Desenvolvedor Atualizado (M/F)",
    "data_nascimento": "Data de Nascimento Atualizada (YYYY-MM-DD)",
    "idade": "Idade do Desenvolvedor Atualizada",
    "hobby": "Hobby do Desenvolvedor Atualizado",
    "nivel_id": "ID do Nível Atualizado"
  }
  ```
- **Respostas**:
  - `200 OK`: Desenvolvedor atualizado com sucesso.
  - `400 Bad Request`: Dados da requisição inválidos.
  - `404 Not Found`: Desenvolvedor não encontrado.

#### `DELETE /desenvolvedores/{id}`

- **Descrição**: Excluir um desenvolvedor.
- **Parâmetros de Caminho**:
  - `id`: ID do desenvolvedor a ser excluído.
- **Respostas**:
  - `200 OK`: Desenvolvedor excluído com sucesso.
  - `404 Not Found`: Desenvolvedor não encontrado.

## Como Executar

### Usando Docker

1. Construa os containers Docker:

   ```sh
   docker-compose up --build -d
   ```

2. A API estará disponível em `http://localhost:8085`.

2. O Front-End estará disponível em `http://localhost:8086`.

## Dependências

- PHP 8.3.3
- Apache
- PostgreSQL 16.3
- Composer 2.6.5
```
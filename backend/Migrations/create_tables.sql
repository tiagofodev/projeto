CREATE TABLE IF NOT EXISTS niveis (
    id SERIAL PRIMARY KEY,
    nivel VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS desenvolvedores (
    id SERIAL PRIMARY KEY,
    nivel_id int REFERENCES niveis(id),
    nome VARCHAR(255) NOT NULL,
    sexo CHAR(1),
    data_nascimento DATE,
    hobby VARCHAR(255)
);
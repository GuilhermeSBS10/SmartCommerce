CREATE TABLE transacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    categoria VARCHAR(100),
    valor DECIMAL(15,2) NOT NULL,
    data DATE NOT NULL,
    CONSTRAINT fk_transacoes_usuario FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

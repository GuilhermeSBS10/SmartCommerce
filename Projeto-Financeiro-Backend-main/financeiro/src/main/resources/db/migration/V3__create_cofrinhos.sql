CREATE TABLE cofrinhos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    objetivo VARCHAR(255),
    valor_alvo DECIMAL(15,2) NOT NULL,
    valor_guardado DECIMAL(15,2) DEFAULT 0.00,
    prazo DATE,
    CONSTRAINT fk_cofrinhos_usuario FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

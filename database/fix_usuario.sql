USE restaurante;

-- Renombrar gmail a email
ALTER TABLE usuario CHANGE COLUMN gmail email VARCHAR(255) NOT NULL;

-- Agregar columnas faltantes
ALTER TABLE usuario 
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE AFTER rol,
ADD COLUMN ultimo_acceso DATETIME NULL AFTER activo,
ADD COLUMN intentos_login INT NOT NULL DEFAULT 0 AFTER ultimo_acceso,
ADD COLUMN bloqueado_hasta DATETIME NULL AFTER intentos_login;

-- Actualizar índice único
ALTER TABLE usuario DROP INDEX usuario_gmail_unique;
ALTER TABLE usuario ADD UNIQUE KEY usuario_email_unique (email);

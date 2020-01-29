USE `ug5kv2`;

ALTER TABLE `ug5kv2`.`recursos_telefono`   
  ADD COLUMN `ats_user` VARCHAR(64) NOT NULL  COMMENT 'Usuario ATS al que se le podria asignar un recurtso PP' AFTER `uri_telefonica`;
-- 
--
ALTER TABLE `ug5kv2`.`lista_uris`   
  CHANGE `uri` `uri` VARCHAR(64) CHARSET latin1 COLLATE latin1_spanish_ci NOT NULL  COMMENT 'Valor de la dirección ip. Puede ser usuario@ip:puerto';
--
-- 
--
ALTER TABLE `ug5kv2`.`recursos_externos`   
  CHANGE `uri` `uri` VARCHAR(64) CHARSET latin1 COLLATE latin1_spanish_ci NOT NULL  COMMENT 'Uri introducida por el usuario para ser seleccionada';

--
--
--
ALTER TABLE `ug5kv2`.`recursos_telefono`   
  CHANGE `uri_telefonica` `uri_telefonica` VARCHAR(64) CHARSET latin1 COLLATE latin1_spanish_ci NULL  COMMENT 'Uri para el recurso telefónico.';
--
--
--
ALTER TABLE `ug5kv2`.`pasarelas`   
  ADD COLUMN `sppe` TINYINT(1) DEFAULT 0  NOT NULL  COMMENT 'Supervision de puerta de enlace. 0: No supervisa. 1..5: tiempo en segundos de la supervision' AFTER `pendiente_actualizar`;
--
--
--
ALTER TABLE `ug5kv2`.`recursos_telefono`   
  ADD COLUMN `det_inversion_pol` TINYINT(1) DEFAULT 0  NOT NULL  COMMENT 'Flag Deteccion de Inversion de polaridad (solo en AB)' AFTER `ats_user`;

--
--
--    
ALTER TABLE `ug5kv2`.`pasarelas`   
  ADD COLUMN `dvrrp` INT(6) DEFAULT 2000  NOT NULL  COMMENT 'Timeout de arranque VRRP (2000 .. 20000)' AFTER `sppe`;

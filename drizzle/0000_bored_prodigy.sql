CREATE TABLE `categorias` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cor` text NOT NULL,
	`protegida` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `extrato_importacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`nome_arquivo` text NOT NULL,
	`identificador_arquivo` text NOT NULL,
	`data_importacao` text DEFAULT (current_timestamp) NOT NULL,
	`quantidade_transacoes` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `extrato_transacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`importacao_id` text NOT NULL,
	`data` text NOT NULL,
	`descricao_bruta` text NOT NULL,
	`valor` real NOT NULL,
	`fornecedor_id` text,
	`categoria_id` text,
	`subcategoria_id` text,
	`status` text DEFAULT 'pendente' NOT NULL,
	`origem_sugestao` text,
	`possivel_duplicado` integer DEFAULT false NOT NULL,
	`moeda_original` text,
	`valor_original` real,
	`cotacao_usada` real,
	FOREIGN KEY (`importacao_id`) REFERENCES `extrato_importacoes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategoria_id`) REFERENCES `subcategorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `extrato_transacoes_importacao_id_idx` ON `extrato_transacoes` (`importacao_id`);--> statement-breakpoint
CREATE INDEX `extrato_transacoes_status_idx` ON `extrato_transacoes` (`status`);--> statement-breakpoint
CREATE INDEX `extrato_transacoes_fornecedor_id_idx` ON `extrato_transacoes` (`fornecedor_id`);--> statement-breakpoint
CREATE INDEX `extrato_transacoes_categoria_id_idx` ON `extrato_transacoes` (`categoria_id`);--> statement-breakpoint
CREATE TABLE `fornecedor_variacoes` (
	`id` text PRIMARY KEY NOT NULL,
	`fornecedor_id` text NOT NULL,
	`texto_bruto` text NOT NULL,
	FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `fornecedor_variacoes_fornecedor_id_idx` ON `fornecedor_variacoes` (`fornecedor_id`);--> statement-breakpoint
CREATE TABLE `fornecedores` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`categoria_id` text,
	`subcategoria_id` text,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subcategoria_id`) REFERENCES `subcategorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subcategorias` (
	`id` text PRIMARY KEY NOT NULL,
	`categoria_id` text NOT NULL,
	`nome` text NOT NULL,
	`icone` text NOT NULL,
	`protegida` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `subcategorias_categoria_id_idx` ON `subcategorias` (`categoria_id`);
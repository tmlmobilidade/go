/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Initial part of the prompt for generating title and description together.
 */
export const initPrompt: Record<I18nCode, string> = {
	en: `
		You generate short Service Alert titles and descriptions for a public transport platform
		used by multiple operators (bus, metro, etc.). Use the operator label provided in the context.
		Write in British English. Return ONLY a valid JSON object with keys "title" and "description"
		(no markdown, no extra text). Title and description must be consistent.
	`,
	pt: `
		# Missão

		A tua missão é gerar um título e uma descrição para um Alerta de Serviço de uma operação de transportes públicos numa área metropolitana.

		Terás disponíveis:
		- a Causa da situação;
		- o Efeito operacional, que é autoritativo;
		- as referências afetadas, que podem ser linhas, paragens, viagens ou toda a rede;
		- informação adicional relevante, como horários, destinos, localização e período de validade do alerta.

		Escreve sempre em Português de Portugal (pt-PT), de forma natural, clara, objetiva e útil para o passageiro.

		---

		# 1. Regras obrigatórias

		## 1.1. Preservar o efeito

		O Efeito fornecido é autoritativo e obrigatório.
		- Não o substituas por outro efeito.
		- Não alteres o seu significado.
		- Não transformes um efeito específico numa formulação mais genérica.
		- Não ignores um detalhe específico do efeito para produzir uma frase mais simples.
		- Adapta a construção frásica ao contexto, mas mantém exatamente o significado operacional fornecido.

		Exemplo:
		Se o efeito for "cancelamento" ou "não realização do serviço", não escrevas que o serviço está "interrompido",
		"condicionado" ou "com atrasos", mas sim que o serviço está "cancelado" ou "não será realizado".

		---

		## 1.2. Não inventar informação

		- Não inventes localizações, horários, destinos, motivos, durações ou consequências.
		- Não deduzas informação operacional que não esteja explicitamente disponível.
		- Não atribuas responsabilidades pela causa a entidades, organizações ou pessoas se isso não estiver
		  explicitamente indicado e não for necessário.
		- Se uma informação não estiver disponível, não a substituas por uma suposição.

		---

		## 1.3. Período de validade vs. horário das viagens

		O período de validade do alerta não corresponde necessariamente ao período ou horário das viagens afetadas.

		- Quando forem fornecidos horários específicos das viagens afetadas, utiliza esses horários.
		- Não uses automaticamente o início ou fim do período de validade do alerta como horário das viagens.
		- Só menciona o período de validade quando este for relevante para o passageiro e estiver disponível de forma útil.

		---

		## 1.4. Causa

		Quando a causa for bem definida, e for útil para o passageiro, menciona-a de forma breve.

		- Indica uma causa única e sucinta.
		- Usa linguagem simples e neutra.
		- Não atribuas culpas.
		- Não acrescentes detalhes sobre a causa que não sejam necessários para compreender a situação.
		- Se a causa for indefinida, utiliza uma formulação genérica e não inventes uma causa.

		Exemplo:
		❌ "Devido ao início das obras de construção de uma rotunda na interseção rodoviária, planeadas pela Câmara Municipal do Barreiro..."
		✅ "Devido a obras..."

		---

		# 2. Princípios de escrita

		## 2.1. Foco

		O alerta deve transmitir rapidamente a informação que é mais útil para o passageiro.

		Quando aplicável, procura responder de forma sucinta a:
		- Onde? — localização afetada;
		- Quando? — data, hora ou período relevante;
		- O quê? — efeito sobre o serviço.

		Estas dimensões são orientadoras, não obrigatórias.
		Não forces a inclusão de uma dimensão quando ela não fizer sentido ou quando não houver informação disponível.
		Não escrevas descrições longas que agreguem várias situações ou contenham informação irrelevante.

		Evita:
		- contextualização excessiva;
		- explicações sobre responsabilidades;
		- consequências óbvias;
		- repetições;
		- detalhes que não ajudem o passageiro a perceber o impacto no serviço.

		---

		## 2.2. Evitar repetições e trivialidades

		Não repitas informação que já esteja implícita ou que não acrescente valor.
		Dizer que existem obras, uma festa, uma manifestação ou outro evento numa via pode ser suficiente
		para explicar a causa da afetação. Não é necessário explicar que esse evento provoca um corte ou condicionamento da via,
		salvo se essa informação for necessária para compreender o efeito fornecido.

		Evita repetir várias vezes a mesma via, paragem ou consequência.

		❌ "Devido ao início das obras haverá corte de trânsito, não sendo possível a utilização das paragens na zona interdita."
		✅ "Devido a obras, não será possível utilizar as paragens {Paragem 1}, {Paragem 2}..."

		---

		## 2.3. Naturalidade

		Não combines mecanicamente o nome de uma referência com o rótulo do efeito.
		Não copies modelos de frase literalmente quando a construção resultar artificial.
		Usa as formulações de efeito fornecidas como **orientação lexical**, mas adapta a frase à referência afetada e ao contexto.

		A formulação final deve:
		- soar natural em Português de Portugal;
		- ser fácil de ler;
		- preservar exatamente o significado do efeito;
		- evitar construções artificiais ou excessivamente burocráticas.

		---

		# 3. Agrupamento de referências

		Um alerta representa uma única situação operacional.

		Quando várias referências partilham a mesma causa e efeito, agrupa-as em vez de criar frases ou avisos separados.

		---

		# 3. Formatação do título

		O título deve permitir ao passageiro perceber rapidamente o que está a acontecer.

		Quando for relevante, inclui:
		- o número da linha ou linhas afetadas;
		- a principal alteração ao serviço.

		Exemplos:
		- "2002, 2003: Desvio por obras"
		- "2207, 2212, 2215: Viagens não realizadas"
		- "Linha 1: Serviço suspenso"

		Não incluas o número da linha quando este não for relevante, aplicável ou suficientemente informativo para o alerta.
		O título deve ser curto e informativo. Não repitas no título todos os detalhes que já estarão na descrição.

		---

		# 4. Formato da resposta

		Devolve apenas um objeto JSON válido, sem markdown, sem comentários e sem qualquer texto adicional.
		Não adiciones asteriscos, negritos, itálicos, listas, etc. no título ou descrição, pois não será possível formatar o texto corretamente.

		A estrutura deve ser exatamente:

		{
			"title": "string",
			"description": "string",
			"motivation": "string"
		}

		-> "title" — O título final do alerta.
		-> "description" — A descrição final do alerta, dirigida ao passageiro.

		-> "motivation" — Uma justificação breve das principais decisões linguísticas e de estrutura
						  utilizadas no título e na descrição. Deve ser curta; não deve repetir integralmente a descrição;
						  deve ser consistente com o resultado produzido; não deve introduzir informação que não esteja refletida
						  no título ou descrição; não deve introduzir informação que não esteja refletida no título ou descrição.

		---

		# 5. Prioridade das instruções

		Quando houver conflito entre instruções, segue esta ordem de prioridade:

		1. Preservar exatamente o efeito operacional fornecido.
		2. Não inventar nem omitir informação operacional relevante.
		3. Produzir informação clara e inequívoca para o passageiro.
		4. Usar Português de Portugal natural.
		5. Ser conciso e evitar repetições.
		6. Otimizar o título e a estrutura da frase.

		A concisão nunca deve resultar na perda de informação necessária para compreender corretamente o alerta.
	`,
};

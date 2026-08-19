/* * */

import { type I18nCode } from '@tmlmobilidade/go-types-shared';

/**
 * Initial part of the prompt for generating title and description together.
 */
export const initDescriptionPrompt: Record<I18nCode, string> = {
	en: `
		You generate short Service Alert titles and descriptions for a public transport platform
		used by multiple operators (bus, metro, etc.). Use the operator label provided in the context.
		Write in British English. Return ONLY a valid JSON object with keys "title" and "description"
		(no markdown, no extra text). Title and description must be consistent.
	`,
	pt: `
		A tua missão é gerar títulos e descrições para Alertas de Serviço de uma operação de transportes públicos
		numa área metropolitana. Mais à frente, tens disponíveis os detalhes específicos da Causa e Efeito do alerta,
		assim como as referências afetadas (linhas, paragens, viagens ou toda a rede do operador).

		Escreve em Português de Portugal, de forma natural e clara, útil para o passageiro.

		Boas práticas para produção de alertas (com exemplos):
		- Responder a três perguntas de forma sucinta:
		-> Onde?: "Devido a obras na rotunda entre a Avenida do Bocage e Rua Miguel Bombarda no Barreiro, "
		-> Quando?: "a partir de {DIA} de {MÊS}"
		-> O quê?: "as linhas 123, 456, 789 terão um desvio de circulação pela Rua ABC e Rua DEF."

		---
		Importante: Foco
		Não escrever descrições longas que sejam vários avisos num só, ou que contenham informação irrelevante
		como responsabilizações de atores sobre a causa. Descrições longas ou que de outra forma sejam palavradas
		e demasiado detalhadas tornam a leitura mais difícil e confusa, podendo comprometer a compreensão da informação-chave.
		Indicar uma causa única e sucinta com linguagem simples, sem culpabilização.
		❌ Exemplo do que NÃO se deve escrever: "Devido ao início das obras de construção de uma rotunda na interseção rodoviária, planeadas pela Câmara Municipal do Barreiro...""
		✅ Exemplo do que se deve escrever: "Devido a obras,..."
		---

		---
		Importante: Evitar repetições ou trivialidades
		Não repetir informação ou dar informação que é consequência lógica.
		Deves ser direto. Dizer que há obras é suficiente para entender que há uma interrupção do trânsito e consequências associadas,
		sem ser necessário esclarecer que obras implicam um corte da via. Tal como dizer que existe uma festa numa rua, ou manifestação, ou outro evento
		se depreende que a via será afetada. Evite repetir várias vezes a mesma via bloqueada.
		❌ Exemplo do que NÃO se deve escrever: "Devido ao início das obras (...) haverá corte de trânsito, não sendo possível a utilização das paragens na zona interdita."
		✅ Exemplo do que se deve escrever: "Devido a obras não será possível utilizar as paragens {Paragem 1}, {Paragem 2}..."
		---

		O efeito fornecido é autoritativo e obrigatório: não o substituas por outro.
		Não ignores um detalhe mais específico para escrever uma versão genérica do alerta.
		Não inventes detalhes de localização se eles não estiverem explicitamente mencionados.

		Não combines mecanicamente o nome da referência com o rótulo do efeito nem copies modelos de frase
		de forma literal. Se uma construção soar artificial, reescreve-a com bom senso mantendo o mesmo significado.

		Importante: Formato da Resposta
		Devolve um pequeno resumo da tua motivação de escolha de palavras, com as principais características que consideras
		relevantes para o título e descrição. Este texto deve ser breve, mas podes utilizar qualquer método que consideras
		adequado para expressar a tua motivação.
		No final da tua resposta, é OBRIGATÓRIO devolver um objeto JSON válido com as chaves "title" e "description" (sem markdown, sem texto extra),
		que será o resultado final do título e descrição, com a tua melhor escolha de palavras. Mantém-te consistente entre o texto resumo, o título e a descrição,
		assim como a estrutura do objeto JSON devolvido.
	`,
};

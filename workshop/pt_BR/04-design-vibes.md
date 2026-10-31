<!-- l10n-sync: source-file="workshop/04-design-vibes.md" -->
# Parte 4: Tema orientado ao design

---

Nesta parte, você vai usar os ciclos de planejamento e implementação do Copilot para projetar uma transformação completa do tema. Essa é uma abordagem de desenvolvimento orientada pelo design: comece com a visão, itere nos elementos visuais e deixe o Copilot cuidar do trabalho pesado de CSS.

## Tarefa 1: Planeje o tema retrô

<!-- track:vscode:start -->
Mude para o modo **Plan** no GitHub Copilot Chat.
<!-- track:vscode:end -->

<!-- track:cli:start -->
Use `/plan` no GitHub Copilot CLI ou pressione **Shift+Tab** até ativar o modo de planejamento.
<!-- track:cli:end -->

Insira este prompt:

> Quero transformar esta página em uma experiência completa de fliperama retrô. Planeje uma reformulação visual abrangente que inclua efeitos de linhas de varredura CRT no fundo, brilho neon no título pulsando como um letreiro, selo VS animado com mudanças nas cores do gradiente, sobreposição de brilho nos cartões de resultados, animações de entrada flutuante nos campos de texto, texto de carregamento alternando entre verde e roxo e efeitos de brilho ao passar o cursor pelos quadrados de contribuições. Mantenha o fundo escuro (`#0a0a1a`) e as cores de destaque verde (`#5fed83`) e roxo (`#8a2be2`). Use um tema escuro com a fonte retrô para jogos Press Start 2P do Google Fonts.

O Copilot vai gerar um plano detalhado com todos os efeitos visuais. **Não aceite imediatamente** — revise o plano e itere:

- Sugira ajustes na duração das animações (por exemplo, *"Make the neon pulse slower, around 3 seconds"*).
- Pergunte sobre efeitos específicos (por exemplo, *"How will the shimmer overlay work on the cards?"*).
- Peça mudanças na abordagem se algo não parecer adequado.

## Tarefa 2: Implemente o tema

Quando estiver satisfeito com o plano, peça ao Copilot para implementá-lo.

> Implemente o plano do tema de fliperama retrô que acabamos de criar.

O Copilot vai adicionar várias animações CSS, pseudoelementos e transições à folha de estilos. Isso pode incluir:

- `@keyframes` para efeitos de scanline, pulso neon, shimmer e entrada flutuante
- Pseudoelementos (`::before`, `::after`) para efeitos de sobreposição
- Propriedades personalizadas de CSS para as cores do tema
- Transições e estados `hover` para elementos interativos

<!-- track:cli:start -->
Depois que as alterações forem aplicadas, use `/diff` para revisar as mudanças de estilo antes de aprová-las.
<!-- track:cli:end -->

## Tarefa 3: Ajuste os efeitos visuais

> **⚠️ Não está vendo as alterações?** Se o tema ou as animações não aparecerem, pare o servidor de desenvolvimento (`Ctrl+C`), reinicie com `npm run dev` e atualize o navegador forçando o recarregamento (`Ctrl+Shift+R`).

Mantenha a prévia do navegador aberta e itere no design. Experimente prompts como:

> O efeito de linhas de varredura está forte demais; reduza a opacidade para 0.03.

> Adicione uma oscilação elétrica sutil ao texto do título.

> O selo VS deve pulsar de forma mais intensa.

Essa é uma abordagem de **desenvolvimento orientado pelo design**: você itera na apresentação visual em tempo real. Cada prompt refina a experiência até chegar ao resultado desejado. Não se contente com algo apenas razoável — aprimore o visual até a página parecer saída de um fliperama.

## Tarefa 4: Atualize as instruções

As instruções devem refletir as decisões importantes de design para que os próximos prompts mantenham a direção definida.

<!-- track:vscode:start -->
Peça ao Copilot Chat:

> Add a design guide section to copilot-instructions.md describing our retro arcade theme: colors, fonts, animation style
<!-- track:vscode:end -->

<!-- track:cli:start -->
Peça ao Copilot CLI:

> Update our repository instructions with a short design guide for the retro arcade theme: colors, fonts, animation style, and the rule that new UI should keep the neon aesthetic.
<!-- track:cli:end -->

Faça commit das instruções e das alterações de design quando a página estiver como você quer.

## ✅ Parte 4 concluída

**O que você aprendeu:**

- Usar fluxos de planejamento para definir um **sistema de design antes de implementá-lo**.
- **Iterar na apresentação visual** com prompts curtos de acompanhamento.
- **Atualizar as instruções após decisões importantes** para preservar a identidade visual.

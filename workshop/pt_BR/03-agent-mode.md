<!-- l10n-sync: source-file="workshop/03-agent-mode.md" -->
# Parte 3: Crie o jogo com fluxos de trabalho agênticos

---

Nesta parte, o Copilot passa de planejador a implementador. Em vez de escrever código linha por linha, descreva o que você quer e deixe o Copilot trabalhar nos arquivos que precisa alterar.

## Tarefa 1: Conecte a batalha

<!-- track:vscode:start -->
1. Mude para o modo **Agent** no Copilot Chat.
2. Insira este prompt:
<!-- track:vscode:end -->

<!-- track:cli:start -->
1. Retorne ao fluxo de programação padrão do Copilot CLI (ou continue no modo autopilot se quiser que o Copilot prossiga até você pará-lo).
2. Se ajudar, indique o arquivo da página para dar contexto: `@src/pages/index.astro`.
3. Insira este prompt:
<!-- track:cli:end -->

   > Adicione JavaScript do lado do cliente à página de batalha para que:
   > 1. Ao clicar no botão Battle, obtenha os dois nomes de usuário dos campos.
   > 2. Valide se ambos foram preenchidos (e mostre um erro caso contrário).
   > 3. Busque em paralelo, pela nossa API, os dados de contribuições dos dois usuários.
   > 4. Exiba os gráficos de contribuições como grids coloridos: cada dia é um quadrado colorido da paleta do GitHub.
   > 5. Mostre um selo VS entre os dois usuários.
   > 6. Exiba o nome de usuário, o total de contribuições e o intervalo de datas de cada usuário.
   > 7. Trate os estados de carregamento e os erros.
   > 8. Também seja acionado ao pressionar Enter nos campos de entrada.
   > 9. Por enquanto, use a interface simples que já está estruturada.
   >
   > Use interfaces do TypeScript para a estrutura de dados de contribuições.

<!-- track:vscode:start -->
3. Deixe o Agent Mode implementar as alterações em vários arquivos, incluindo `index.astro`.
4. Revise as alterações propostas na visualização de diferenças antes de aceitá-las.
<!-- track:vscode:end -->

<!-- track:cli:start -->
4. Deixe o Copilot CLI trabalhar em `src/pages/index.astro`.
5. Inspecione as alterações geradas com `/diff` e aprove-as.
<!-- track:cli:end -->

## Tarefa 2: Teste a batalha

> **⚠️ Não está vendo as alterações?** Se a página de batalha não tiver sido atualizada, pare o servidor de desenvolvimento (`Ctrl+C`), reinicie com `npm run dev` e atualize o navegador.

1. Digite `octocat` e `torvalds` como os nomes de usuário e clique em **Battle**.
2. Você deverá ver os gráficos de contribuições dos dois usuários lado a lado, em grids coloridos.
3. Teste os casos de erro:
   - Deixe um ou ambos os campos vazios e clique em Battle: deverá aparecer um erro de validação.
   - Digite um nome de usuário inválido: o aplicativo deverá mostrar um erro da API.
4. Pressione **Enter** em qualquer campo: a batalha deverá começar como se você tivesse clicado no botão.

## Tarefa 3: Itere com o Copilot

Se algo não estiver totalmente correto, envie feedback diretamente ao Copilot. Por exemplo:

- *"Os quadrados de contribuições estão grandes demais; deixe-os com 12x12px"*
- *"Adicione uma dica ao passar o cursor que mostre a data e a contagem de contribuições"*
- *"O estado de carregamento precisa de uma animação pulsante"*

<!-- track:vscode:start -->
O Agent Mode lida naturalmente com alterações em vários arquivos e iterações. Cada prompt de acompanhamento aproveita o contexto da conversa anterior, permitindo aprimorar a implementação aos poucos sem recomeçar do zero.
<!-- track:vscode:end -->

<!-- track:cli:start -->
As sessões do Copilot CLI mantêm o histórico, então cada prompt de acompanhamento se baseia nos anteriores. Use `/session` ou `/context` para consultar o contexto que o Copilot está mantendo e `/review` depois de uma iteração maior para procurar bugs ou melhorias.
<!-- track:cli:end -->

## Dicas para esta parte

- **Seja específico sobre o que você quer:** requisitos claros levam a resultados melhores.
- **Divida tarefas grandes em prompts menores** se o Copilot sair do rumo.
- **Revise as alterações antes de aceitá-las:** é mais rápido inspecionar o código gerado do que reescrevê-lo depois.
- **Teste o aplicativo logo após cada etapa de implementação** para localizar problemas.

## ✅ Parte 3 concluída

Você aprendeu a:

- Usar o Copilot para **implementar alterações em vários arquivos**.
- **Iterar nos resultados** com feedback específico.
- Conduzir o **ciclo completo de uma funcionalidade**: implementação, revisão, testes e aprimoramento.

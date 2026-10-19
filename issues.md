1. Zonas e Afetação
2. Documentação do apex_network.txt file (novo afetacao.csv)
3. Exportação do plano de oferta na GTFS v30
4. Migração do vidowall para o GO
5. Possibilidade de criação de videowalls para vários operadores
6. LIgar performance novamente
7. Adicionar obrigatoriedade de selecionar um operador no modal de criação de paragens (min flags = 1)
8. Limpar oferta
  1. separação das dates e offer
  2. exportação de linhas
  3. exportação de zonas
  4. Criar um organizer para a oferta
    1. Adicionar paragens que pertencem a uma zona tarifária (e não zonas que pertencem à paragem)
9. Novas funcionalidades oferta
  1. Detetar regras de tempos de viagem sugeridas
  2. Identificar horários com menos de x passageiros em y dias
10. Automação dos issues
  1. Preencher o Quarter num intervalo
  2. Passar a stale ao fim de x dias sem commits ou comentários
  3. Só pode ser merged depois de fazer build e correr lint com sucesso
  4. Detetar issues parecidos e sugerir merge
  5. Utilizar copilot para detetar falhas na formatação do código, bugs, etc. (estilo gemini)
  6. Criar issues automáticos (ou PRs automáticos) para atualizar pacotes e imagens (go + docs + infra)
  7. Templates de criação de issues
  8. Skills para criar issues
11. Passar o que falta do exporter para extractions
12. Melhorias Alertas
  1. Estado adicional "agendado" para alertas (auto change no organizer)
  2. Exportação de alertas
  3. Finalizar sincronização com DATIK TST
  4. Preview de como vai ser mostrado o alerta no GMaps, Transit, etc.
13. Importação de imagens nas paragens
14. AI: Adicionar i18n a todos os módulos, em PT e ES
15. Terminar formulário das escolas na infraestrutura
16. Melhorias UI
  1. Adicionar footer às tabelas com totais e outras infos
17. Exportação de linhas por paragem como no antigo GO (na oferta?)
18. Pipeline de anonimização de dados para ser possível exportar dados de validações mais facilmente
19. Adicionar metadados ao detalhe das rides + informações interessantes (ex: velocidade média, gráfico de velocidades, gráfico de validações)
20. AI: Organização de tipos para caching (use cacheDb.setNew function everywhere)
21. Separar UI em vários pacotes individuais (@tmlmobilidade/go-ui-datatable, /go-ui-layout, /go-ui-providers, etc.)
22. Rides não planeadas — desdobramentos e viagens manuais
23. Módulo de remuneração
24. Reativar fleet, mapear GTFS v30 para novos atributos
25. Adicionar botão de retry da extraction e mostrar número de tentativas falhadas
26. Documentar algoritmo ETA + blog post
27. Testes de carga no MOTIS
28. Testes de carga no Hub
29. Cache do nginx
30. Documentação dos serviços do GO
31. Grafana views
  1. Transações com ID diferente, mesmo SAM, mesmo ase_counter_value
32. Wizard de unificação de paragens de diferentes operadores
33. Sincronização da info de paragens com o OSM
  1. Store OSM ID da paragem
  2. Organizer syncs info on a schedule
34. Reativar proposed changes nas paragens e dar acessos aos municípios
35. Consumo automático de novas versões do GTFS para cada operador (estilo GMaps)
36. Tornar visível quando há planos sobrepostos para o mesmo operador (no footer, um triângulo nos planos, ...)
37. Adicionar secção com estatísticas do plano de operação
38. Novas normalizações aos planos
  1. Uniformização de distâncias (qlq escala para metros)
39. Transformar scripts bash em JS
  1. generate-routes
  2. Generate go-lang types
40. Implementar sumário executivo
41. Admin views para controlar e monitorizar análise de rides
42. Criar opção para enviar feedback no GO
43. Migrar serviço anónimo de notificações inteligentes para o GO
44. Melhores páginas de estado, para todos os serviços e endpoints e públicas
45. Corrigir Logger.init(), etc para novo modelo
46. Adicionar ao package `telemetry` a opção `Uptime` para enviar notificações de downtime
47. Verificar se UptimeKuma ainda faz sentido ou dá para fazer tudo no grafana (acho que ainda faz)
48. Passar as classes do telemetry para objetos JS mais simples
49. Passar as classes do locations provider para objetos JS mais simples
50. Feedback navegante deveria guardar as respostas no rawDB, right?
51. Exportação oferta em NETEX
  1. Criar package para ler e escrever XML
52. Remover packages antigos que já não são usados
53. Trocar nome da pasta packages-new para packages
54. Documentar tabelas do Clickhouse nos docs e nas próprias tabelas com as funções de comentários do Clickhouse
55. Possibilidade de ter um wrapper em electron?
56. Uniformizar / limpar / finalizar eventos iniciais / antigos na rawDb
57. Login redirect to where user was
SITE DE LEITURA DE LEIS – PRONTO PARA GITHUB PAGES

COMO USAR
1) Suba todos os arquivos deste ZIP para um repositório do GitHub (ex.: legislacoes).
2) Ative o GitHub Pages nas configurações (Settings > Pages > Build and deployment > Deploy from a branch > Branch: main / (root) > Save).
3) Abra a URL https://SEU-USUARIO.github.io/legislacoes/

ADICIONAR/ATUALIZAR LEIS
• Coloque o texto completo da lei (versão consolidada do Planalto) em um arquivo .txt na pasta /leis.
• Edite leis/manifest.json e adicione (ou ajuste) um item:
  {
    "id": "lei-10826-2003",
    "title": "Lei nº 10.826/2003 (Estatuto do Desarmamento)",
    "file": "leis/lei-10826-2003.txt"
  }

DICA: Cole o texto direto do “compilado” do Planalto para ter a versão atualizada, incluindo artigos com sufixo (ex.: 12-A, 20-B). O site detecta automaticamente os “Art.” e monta a navegação.

BUSCA
• Use a caixa de busca no topo para filtrar por número do artigo (ex.: “art. 6”) ou por palavras (ex.: “porte”, “Sinarm”).

IMPRIMIR/ESTUDAR
• Ctrl+P imprime só o conteúdo do artigo (sem menu), com formatação limpa.

—
Observação legal: Leis federais brasileiras são de domínio público. Ainda assim, prefira colar o texto do Planalto (compilado) para refletir alterações mais recentes.

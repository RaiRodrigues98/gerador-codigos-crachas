# Gerador de Códigos para Crachás
Gerador estático de Code 128 e QR Code com conteúdo exato `email + \t + senha`. Sem backend, analytics, cookies ou armazenamento local. Bibliotecas incluídas no projeto, sem CDN.

## Publicar na Vercel
1. Extraia o ZIP e envie esta pasta para um repositório GitHub.
2. Na Vercel, escolha Add New → Project e importe o repositório.
3. Framework Preset: Other. Sem comando de build. Output Directory: `.`.
4. Clique em Deploy. Não são necessárias variáveis de ambiente.

Alternativa: execute `npx vercel --prod` nesta pasta, com sua conta autenticada.

## Uso
Digite o e-mail e a senha, selecione formato e dimensões em centímetros e gere. QR sempre quadrado. PDF tem página nas dimensões exatas. Imprima em 100%, sem ajuste à página. PNG é rasterizado com resolução equivalente a 600 dpi; use PDF ou SVG para preservar medidas físicas na impressão.

A etiqueta contém a senha recuperável. Não compartilhe. Os campos iniciam vazios e não são persistidos. Não utilize credenciais reais em commits ou exemplos.

Leitura não significa login automático: o dispositivo precisa transmitir o caractere ASCII 9 como tecla Tab, com o foco inicial em E-mail. Não há Enter no conteúdo. Configure o sufixo do leitor se necessário. Teste na tela de login e no modelo de coletor utilizado. Code 128 limitado a ASCII; dimensões pequenas podem impedir leitura. O aviso de densidade é indicativo, não garante compatibilidade.

Bibliotecas: JsBarcode 3.12.3 (MIT), qrcode-generator 2.0.4 (MIT), jsPDF 3.0.4 (MIT). Licenças em vendor.

$(document).ready(function () {
    // Carrega o conteúdo da aba "Níveis" quando a página é carregada
    $("#niveis").load("./view/lista_niveis.html");

    // Adiciona evento para carregar o conteúdo da aba "Desenvolvedores" quando a aba é ativada
    $('#desenvolvedores-tab').on('click', function() {
        $("#desenvolvedores").load("./view/lista_desenvolvedores.html");
    });
});